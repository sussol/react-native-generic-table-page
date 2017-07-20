# react-native-generic-table-page

Provides a generic implementation of a standard page in a data-centric app, containing a table of data, a search bar.
contains a searchable table.

![Example generic table page](https://cloud.githubusercontent.com/assets/1274422/22757270/0a2fe956-eeaf-11e6-9838-6e5c0c6961e3.png)

## Installation

```npm install --save react-native-generic-table-page```

## Usage

For working examples of usage, see [mSupply Mobile](https://github.com/sussol/mobile).

### Required Props

#### columns (array)
An array of objects defining each of the columns. Each entry must contain the 'key' (string), 'width' (integer), and 'title' (string) of the column. Each may optionally contain 'sortable' (boolean).

#### data (array)
Defines the data displayed in the table, ready for sorting and filtering

### Optional Props

#### refreshData(searchTerm, sortBy, isAscending)
This method should filter the data to match the given parameters, and update the 'data' prop passed in. If provided, the generic table page will display a search bar. If not provided, the generic table page will take care of sorting internally, as well as filtering if 'searchKey' is provided (see below)

#### searchKey (string)
Defines the column to filter on when the user types in the search bar. If provided, the page will display a search bar. Don't provide if you control data filtering externally using refreshData (see above)

#### defaultSortKey (string)
Defines the column to sort on by default

#### defaultSortDirection (string)
Either 'ascending' or 'descending', defines which direction to sort the data initially

#### footerData (object)
If passed in, defines data to display in a footer row that is always rendered at the bottom of the
data table

#### renderCell(key, record)
This method defines how each cell is rendered, given the column key and database record. The default method returns a simple string, which will be rendered in a static text cell. Alternative formats are listed in the method comment within index.js

#### onEndEditing(key, rowData, newValue)
Carries out any response required when an editable cell is edited. The obvious example is saving the new value to the database.

#### onSelectionChange(newSelection)
A callback with the array of ids representing all rows with a checkable cell turned 'on'

#### selection (array)
If selection is controlled externally, defines an array of ids of rows that are 'selected', i.e. a checkable cell is turned on in that row

#### renderExpansion (rowData)
Defines the component to be rendered in the expansion area if a row is pressed. Should not be used in conjunction with onRowPress (see below)

#### renderTopLeftComponent (function)
Defines the component to be rendered in the top left corner of the page, above the search bar and data table

#### renderTopRightComponent (rowData)
Defines the component to be rendered in the top right corner of the page, to the right of the search bar and above the data table

#### onRowPress (rowData)
Allows defining some custom behaviour on pressing a row, e.g. navigating to a drilled down view related to the row's data. Called when a row is pressed with the rowData as the single argument. Should not be provided if rows are not pressable, or if renderExpansion is provided

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

#### searchBarPlaceholderText (string)
The placeholder text for the search bar

#### colors (object)
Sets the color of components within the data table, including
* checkableCellDisabled
* checkableCellChecked
* checkableCellUnchecked
* editableCellUnderline

#### children (array)
Any children passed in will be rendered below the data table (useful for modals)
