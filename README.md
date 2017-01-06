# react-native-generic-table-page

Provides a generic implementation of a standard page in a data-centric app, containing a table of data, a search bar.
contains a searchable table.

The class provided by this library is not a complete implementation, and needs to be extended by an implementing class. Details of what can/must be overridden follow. See inline comments in index.js for more info.

### Required Methods

#### getFilteredSortedData(searchTerm, sortBy, isAscending)
This method should return a refreshed realm results object containing data that matches the given parameters.

### Required State

#### this.state.columns
An array of objects defining each of the columns. Each entry must contain the 'key' (string), 'width' (integer), and 'title' (string) of the column. Each may optionally contain 'sortable' (boolean).

### Optional Methods

#### renderCell(key, record)
This method defines how each cell is rendered, given the column key and database record. The default method returns a simple string, which will be rendered in a static text cell. Alternative formats are listed in the method comment within index.js

#### onRowPress(key, rowData)
Carries out any response required to a row being pressed. Should not be overridden if the rows are not pressable.

#### onEndEditing(key, rowData, newValue)
Carries out any response required when an editable cell is edited. The obvious example is saving the new value to the database.

### Optional Props

#### topRoute (boolean)
Whether this page is on top of the navigation stack. Determines whether it will refresh the page's data if a change is detected.

#### rowHeight (integer)
Sets the height of the rows in the data table.

#### pageStyles (object)
Sets the style of components within the page, including
* searchBar (style of the search bar, see github.com/sussol/react-native-ui-components for details)
* pageContentContainer (style of the outer containing View)
* container (style of the inner containing View)
* pageTopSectionContainer (style of the container View above the data table)
* pageTopLeftSectionContainer (style of the View within the pageTopSectionContainer View, contains the search bar by default)

#### dataTableStyles (object)
Sets the style of components within the data table, including
* dataTable
* cell
* header
* headerCell
* rightMostCell
* text
See github.com/sussol/react-native-data-table for details

#### searchBarColor (string)
Sets the color of the search bar, see github.com/sussol/react-native-ui-components for details

#### colors (object)
Sets the color of components within the data table, including
* checkableCellDisabled
* checkableCellChecked
* checkableCellUnchecked
* editableCellUnderline

#### footerData (object)
If passed in, defines data to display in a footer row that is always rendered at the bottom of the
data table
