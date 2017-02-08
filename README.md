# react-native-generic-table-page

Provides a generic implementation of a standard page in a data-centric app, containing a table of data, a search bar.
contains a searchable table.

![Example generic table page](https://cloud.githubusercontent.com/assets/1274422/22757270/0a2fe956-eeaf-11e6-9838-6e5c0c6961e3.png)

## Installation

The customisation can be done through either composition or inheritance. Fitting with react paradigms, we recommend using composition. We have used inheritance successfully in the mSupply mobile project, but we would prefer that future projects simply expose more props and use composition rather than using the method overriding.

### Required Props

#### columns (array), or assign this.state.columns in the constructor if using inheritance
An array of objects defining each of the columns. Each entry must contain the 'key' (string), 'width' (integer), and 'title' (string) of the column. Each may optionally contain 'sortable' (boolean).

#### data (array), or override getFilteredSortedData if using inheritance (see [below](#optional-methods))
Defines the data displayed in the table, ready for sorting and filtering

### Optional Props

#### defaultSortKey (string)
Defines the column to sort on by default

#### searchKey (string)
Defines the column to filter on when the user types in the search bar

#### footerData (object)
If passed in, defines data to display in a footer row that is always rendered at the bottom of the
data table

#### onRowPress (function)
Called when a row is pressed with the rowData as the single argument

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

#### topRoute (boolean)
Whether this page is on top of the navigation stack. Determines whether it will refresh the page's data if a change is detected.

### Optional Methods (If Using Inheritance)
If inheriting, the class provided by this library will be extended by an implementing class. This implementation class has the opportunity to override methods to customise the look and functionality of the generic table page. See inline comments in index.js for more info.

#### getFilteredSortedData(searchTerm, sortBy, isAscending)
This method should return a refreshed realm results object containing data that matches the given parameters. If not overridden, must pass in 'data' to be sorted and filtered using the default method

#### renderCell(key, record)
This method defines how each cell is rendered, given the column key and database record. The default method returns a simple string, which will be rendered in a static text cell. Alternative formats are listed in the method comment within index.js

#### onRowPress(key, rowData)
Carries out any response required to a row being pressed. Should not be overridden if the rows are not pressable.

#### onEndEditing(key, rowData, newValue)
Carries out any response required when an editable cell is edited. The obvious example is saving the new value to the database.
