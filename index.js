/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Cell,
  CheckableCell,
  DataTable,
  EditableCell,
  Header,
  HeaderCell,
  Row,
} from 'react-native-data-table';
import Icon from 'react-native-vector-icons/Ionicons';
import { ListView } from 'realm/react-native';
import { SearchBar } from 'react-native-ui-components';

import { filterObjectArray, sortObjectArray } from './utilities';

/**
 * Provides a generic implementation of a standard page in a data-centric app, which
 * contains a searchable table. Should always be overridden, in particular the
 * following methods and instance variables (fields):
 * @method getFilteredSortedData(searchTerm, sortBy, isAscending) Should return updated data
 * @method renderCell(key, record) Should define what to render in a cell with the
 *         											 given column key and database record
 * @method onRowPress(key, rowData) Should define behaviour when a row is pressed,
 *         											 don't override if row should not be pressable
 * @method onEndEditing(key, rowData, newValue) Handles user input to an editable cell
 * @field  {array}  columns      An array of objects defining each of the columns.
 *         											 Each column must contain: key, width, titleKey. Each
 *         											 may optionally also contain a boolean 'sortable'.
 * The following should not be overridden:
 * @field  {array}  cellRefsMap  Stores references to TextInputs in editableCells so next button
 *                               on native keyboard focuses the next cell. Order is left to
 *                               right within a row, then next row (not to be overridden)
 * @state  {ListView.DataSource} dataSource    DataTable input, used to update rows
 *         																		 being rendered
 * @state  {string}              searchTerm    Current term user has entered in search bar
 * @state  {string}              sortBy        The property to sort by (is selected
 *                                             by column press).
 * @state  {boolean}             isAscending   Direction sortBy should sort
 *                                             (ascending/descending:true/false).
 * N.B. Take care to call parent method if overriding any of the react life cycle methods.
 */
export class GenericTablePage extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      columns: props.columns || [],
      dataSource: dataSource,
      searchTerm: '',
      sortBy: props.defaultSortKey || '',
      isAscending: true,
      selection: [],
      expandedRows: [],
      modalKey: null,
      pageContentModalIsOpen: false,
    };
    this.cellRefsMap = {}; // { rowId: reference, rowId: reference, ...}
    this.dataTableRef = null;
    this.dataTypesSynchronised = [];
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.focusNextField = this.focusNextField.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderCell = this.renderCell.bind(this);
    this.refreshData = this.refreshData.bind(this);
  }

  componentWillMount() {
    this.refreshData();
  }

  /**
   * Refresh data every time the page becomes the top route, so that changes will show
   * when a user returns to the page using the back button.
   */
  componentWillReceiveProps(props) {
    if (!this.props.topRoute && props.topRoute) this.refreshData();
  }

  onSearchChange(searchTerm) {
    this.setState({ searchTerm: searchTerm }, () => {
      this.refreshData();
      if (this.dataTableRef) this.dataTableRef.scrollTo({ y: 0, animated: false });
    });
  }

  onColumnSort(sortBy) {
    if (this.state.sortBy === sortBy) { // Changed column sort direction
      this.setState({ isAscending: !this.state.isAscending }, this.refreshData);
    } else { // Changed sorting column
      this.setState({
        sortBy: sortBy,
        isAscending: true,
      }, this.refreshData);
    }
  }

  /**
   * Adds/removes rowData.id to/from the selection array in state. Must call this within any
   * overrides. i.e. super.onCheckablePress(rowData);
   */
  onCheckablePress(rowData) {
    const newSelection = [...this.state.selection];
    if (newSelection.indexOf(rowData.id) >= 0) {
      newSelection.splice(newSelection.indexOf(rowData.id), 1);
    } else {
      newSelection.push(rowData.id);
    }
    this.setState({ selection: newSelection });
  }

  /**
   * Adds/removes rowData.id to/from the expandedRows array in state. Must call this within any
   * overrides i.e. super.onExpandablePress(rowData);
   */
  onExpandablePress(rowData) {
    const newExpandedRows = [...this.state.expandedRows];
    if (newExpandedRows.indexOf(rowData.id) >= 0) {
      newExpandedRows.splice(newExpandedRows.indexOf(rowData.id), 1);
    } else {
      newExpandedRows.push(rowData.id);
    }
    this.setState({ expandedRows: newExpandedRows });
  }

  openModal(key) {
    this.setState({ modalKey: key, pageContentModalIsOpen: true });
  }

  closeModal() {
    this.setState({ pageContentModalIsOpen: false });
  }

  scrollTableToRow(rowId) {
    // Scrolls to row of rowId with a couple rows above it, unless the rowId is of the top 3 rows,
    // where it just scrolls to the top.
    const yValue = Math.max((rowId - 2) * this.props.rowHeight, 0);
    if (this.dataTableRef) this.dataTableRef.scrollTo({ y: yValue });
  }

  focusNextField(currentCellRef) {
    const nextCellRef = currentCellRef + 1;
    if (this.cellRefsMap[nextCellRef]) {
      this.scrollTableToRow(nextCellRef);
      this.cellRefsMap[nextCellRef].focus();
    } else {
      // Protect against crash from null being in the Map.
      if (this.cellRefsMap[currentCellRef]) this.cellRefsMap[currentCellRef].blur();
    }
  }

  refreshData() {
    this.cellRefsMap = {};
    const { dataSource, searchTerm, sortBy, isAscending } = this.state;
    const filteredSortedData = this.getFilteredSortedData(searchTerm, sortBy, isAscending);
    this.setState({ dataSource: dataSource.cloneWithRows(filteredSortedData) });
  }

  getFilteredSortedData(searchTerm, sortBy, isAscending) {
    const { data, searchKey } = this.props;
    // Filter by searchKey, or if none was passed in props, return full set of data
    let results = searchKey ? filterObjectArray(data, searchKey, searchTerm) : data;
    results = sortObjectArray(results, sortBy, isAscending);
    return results;
  }

/**
 * Accepted Cell formats:
 * 1. <Cell style={styles.cell} width={3}/> // Or any other react component. Must be styled within
 *                                          // the extending class.
 * 2. item.name;
 * 3. {
 *      type: 'text',
 *      cellContents: item.name,
 *    };
 * 4. {
 *      type: 'editable',
 *      cellContents: transactionItem.totalQuantity,
 *    };
 * 4. {
 *      type: 'editable',
 *      cellContents: item.countedTotalQuantity,
 *      keyboardType: numeric,
 *      returnKeyType: 'next',
 *      placeholder: 'No change',
 *    };
 * 6. {
 *      type: 'checkable',
 *      isDisabled: false,
 *    };
 * 7. {
 *      type: 'checkable',
 *      icon: 'md-remove-circle', // will use for both Checked and NotChecked, only colour changes
 *      isDisabled: false,
 *    };
 * 8. {
 *      type: 'checkable',
 *      iconChecked: 'md-radio-button-on',
 *      iconNotChecked: 'md-radio-button-off',
 *      isDisabled: false,
 *    };
 */
  renderCell(key, record) {
    return record[key];
  }

  renderHeader() {
    // If no columns have titles, don't render a header
    if (!this.state.columns.find((column) => column.title && column.title.length > 0)) {
      return null;
    }
    const { header, headerCell, rightMostCell, text } = this.props.dataTableStyles;
    const headerCells = [];
    this.state.columns.forEach((column, index, columns) => {
      let textStyle;
      let cellStyle = index !== columns.length - 1 ? headerCell : [headerCell, rightMostCell];

      switch (column.alignText) {
        case 'left':
        default:
          textStyle = [defaultStyles.alignTextLeft, text];
          break;
        case 'center':
          textStyle = [defaultStyles.alignTextCenter, text];
          cellStyle = [cellStyle, { justifyContent: 'center' }];
          break;
        case 'right':
          textStyle = [defaultStyles.alignTextRight, text];
          cellStyle = [cellStyle, { justifyContent: 'flex-end' }];
          break;
      }

      const sortFunction = column.sortable ? () => this.onColumnSort(column.key) : null;
      headerCells.push(
        <HeaderCell
          key={column.key}
          style={cellStyle}
          textStyle={textStyle}
          width={column.width}
          onPress={sortFunction}
          isAscending={this.state.isAscending}
          isSelected={this.state.sortBy === column.key}
          text={column.title}
        />
      );
    });
    return (
      <Header style={header}>
        {headerCells}
      </Header>
    );
  }

  renderRow(rowData, sectionId, rowId) {
    const { checkableCell, rightMostCell, row, text } = this.props.dataTableStyles;
    // If the rowData has the function 'isValid', check it to see the object still exists
    if (typeof rowData.isValid === 'function' && !rowData.isValid()) {
      return null; // Don't render if the row's data has been deleted
    }
    const cells = [];
    const isExpanded = this.state.expandedRows.includes(rowData.id);
    // Make rows alternate background colour
    const rowStyle = rowId % 2 === 1 ? row : [row, { backgroundColor: 'white' }];

    this.state.columns.forEach((column, index, columns) => {
      let textStyle;
      switch (column.alignText) {
        case 'left':
        default:
          textStyle = [defaultStyles.alignTextLeft, text];
          break;
        case 'center':
          textStyle = [defaultStyles.alignTextCenter, text];
          break;
        case 'right':
          textStyle = [defaultStyles.alignTextRight, text];
          break;
      }

      let cellStyle = index !== columns.length - 1 ?
                            [this.props.dataTableStyles.cell] :
                            [this.props.dataTableStyles.cell, rightMostCell];
      cellStyle.push({ height: this.props.rowHeight });
      const renderedCell = this.renderCell(column.key, rowData);

      let cell;
      switch (renderedCell.type) {
        case 'custom':
          cell = renderedCell.cell;
          break;
        case 'checkable': {
          // if provided, use isChecked prop, else set isChecked according to rowData.id
          // being in selection array.
          const isChecked = renderedCell.isChecked ?
            renderedCell.isChecked : this.state.selection.indexOf(rowData.id) >= 0;
          let iconChecked;
          let iconNotChecked;
          if (renderedCell.iconChecked && renderedCell.iconNotChecked) {
            iconChecked = renderedCell.iconChecked;
            iconNotChecked = renderedCell.iconNotChecked;
          } else if (renderedCell.icon) {
            iconChecked = renderedCell.icon;
            iconNotChecked = renderedCell.icon;
          } else {
            iconChecked = 'md-radio-button-on';
            iconNotChecked = 'md-radio-button-off';
          }
          const { colors } = this.props;
          cell = (
            <CheckableCell
              key={column.key}
              style={[
                cellStyle,
                checkableCell,
              ]}
              width={column.width}
              onPress={() => this.onCheckablePress(rowData)}
              renderDisabled={() =>
                <Icon name={iconNotChecked} size={15} color={colors.checkableCellDisabled} />
              }
              renderIsChecked={() =>
                <Icon name={iconChecked} size={15} color={colors.checkableCellChecked} />
              }
              renderIsNotChecked={() =>
                <Icon name={iconNotChecked} size={15} color={colors.checkableCellUnchecked} />
              }
              isChecked={isChecked}
              isDisabled={renderedCell.isDisabled}
            />
          );
          break;
        }
        case 'editable':
          cell = (
            <EditableCell
              key={column.key}
              refCallback={(reference) => { this.cellRefsMap[rowId] = reference; }}
              style={cellStyle}
              textStyle={textStyle}
              width={column.width}
              returnKeyType={renderedCell.returnKeyType || 'next'}
              selectTextOnFocus={true}
              placeholder={renderedCell.placeholder}
              keyboardType={renderedCell.keyboardType || 'numeric'}
              onEndEditing={(target, value) => {
                if (!this.onEndEditing) return;
                this.onEndEditing(column.key, target, value);
                this.refreshData();
              }}
              onSubmitEditing={() => this.focusNextField(parseInt(rowId, 10))}
              target={rowData}
              value={renderedCell.cellContents}
              underlineColorAndroid={this.props.colors.editableCellUnderline}
            />
          );
          break;
        case 'text':
        default:
          cell = (
            <Cell
              key={column.key}
              style={cellStyle}
              textStyle={textStyle}
              width={column.width}
              numberOfLines={renderedCell.lines}
            >
              {renderedCell.hasOwnProperty('cellContents') ?
                renderedCell.cellContents :
                renderedCell}
            </Cell>
          );
      }
      cells.push(cell);
    });
    return (
      <Row
        style={rowStyle}
        renderExpansion={this.renderExpansion && (() => this.renderExpansion(rowData))}
        isExpanded={isExpanded}
        onPress={
          this.renderExpansion && (() => this.onExpandablePress(rowData))
            || this.onRowPress && (() => this.onRowPress(rowData))
            || this.props.onRowPress && (() => this.props.onRowPress(rowData))
        }
      >
        {cells}
      </Row>
    );
  }

  renderSearchBar() {
    const { pageStyles, searchBarColor } = this.props;
    return (
      <SearchBar
        onChange={this.onSearchChange}
        style={pageStyles.searchBar}
        color={searchBarColor}
      />);
  }

  // Footer is just a spacer at the bottom of tables allowing the user to scroll beyond
  // the last row rendered. Alleviates the problem of the keyboard covering the last rows
  // of the table.
  renderFooter() {
    return (
      <View>
        {this.props.footerData && this.renderRow(this.props.footerData, 0, 0)}
        <View style={{ height: 8 * this.props.rowHeight }} />
      </View>
    );
  }

  renderDataTable() {
    return (
      <DataTable
        refCallback={(reference) => (this.dataTableRef = reference)}
        style={this.props.dataTableStyles.dataTable}
        listViewStyle={defaultStyles.listView}
        renderFooter={this.renderFooter}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        renderHeader={this.renderHeader}
      />);
  }

  render() {
    const { hideSearchBar, pageStyles } = this.props;
    return (
      <View style={[defaultStyles.pageContentContainer, pageStyles.pageContentContainer]}>
        <View style={[defaultStyles.container, pageStyles.container]}>
          <View style={[defaultStyles.pageTopSectionContainer, pageStyles.pageTopSectionContainer]}>
            {!hideSearchBar &&
              <View
                style={[defaultStyles.pageTopLeftSectionContainer,
                        pageStyles.pageTopLeftSectionContainer]}
              >
                {this.renderSearchBar()}
              </View>
            }
          </View>
          {this.renderDataTable()}
        </View>
      </View>
    );
  }
}

GenericTablePage.propTypes = {
  colors: React.PropTypes.object,
  columns: React.PropTypes.array,
  data: React.PropTypes.array,
  dataTableStyles: React.PropTypes.object,
  defaultSortKey: React.PropTypes.string,
  footerData: React.PropTypes.object,
  hideSearchBar: React.PropTypes.bool,
  onRowPress: React.PropTypes.func,
  pageStyles: React.PropTypes.object,
  rowHeight: React.PropTypes.number,
  searchBarColor: React.PropTypes.string,
  searchKey: React.PropTypes.string,
  topRoute: React.PropTypes.bool,
};

GenericTablePage.defaultProps = {
  dataTableStyles: {},
  pageStyles: {},
  rowHeight: 45,
};

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
  },
  pageContentContainer: {
    flex: 1,
  },
  pageTopSectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  pageTopLeftSectionContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: 500,
  },
  pageTopRightSectionContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  listView: {
    flex: 1,
  },
  alignTextLeft: {
    marginLeft: 20,
    textAlign: 'left',
  },
  alignTextCenter: {
    textAlign: 'center',
  },
  alignTextRight: {
    marginRight: 20,
    textAlign: 'right',
  },
});
