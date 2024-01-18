/**
 * Main component of the application.
 * Retrieves and processes data on COVID-19 distribution from the source https://opendata.ecdc.europa.eu/covid19/casedistribution/json/.
 * This component handles the working logic with the received data, including aggregation and presentation through various interface components.
 * 
 */


// React is a JavaScript library for building user interfaces.
// It allows developers to create reusable UI components and manage the state of the application efficiently.
// React promotes a declarative and component-based approach, making it easier to understand and maintain code.
import React, { useState, useEffect } from 'react';
// Importing necessary hooks from the React library.
// - useState: Allows the use of state in functional components.
// - useEffect: Enables performing side effects in functional components, similar to componentDidMount and componentDidUpdate in class components.


// Axios is a promise-based HTTP client for making asynchronous HTTP requests.
// It simplifies handling AJAX requests and supports features like request and response interception, global error handling, and more.
import axios from 'axios';
// Importing the axios library for making HTTP requests in the application.


// react-datepicker is a flexible and customizable date picker component for React applications.
// It provides a user-friendly way to select dates with various customization options.
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// Importing the DatePicker component along with its default styles.


// react-select is a flexible and highly customizable select input component for React.
// It allows users to choose options from a dropdown menu, and it supports searching, grouping, and other advanced features.
import Select from 'react-select';
// Importing the Select component for creating customizable select input fields.


// ChartComponent is a custom component responsible for rendering charts in the application.
// It utilizes the Chart.js library to create interactive and visually appealing charts for visualizing COVID-19 data.
import ChartComponent from './Chart.js';
// Importing the ChartComponent from the 'Chart.js' file.


// TableRow is a custom component representing a single row in the data table.
// It displays information about COVID-19 statistics for a specific country, such as cases, deaths, total cases, total deaths, etc.
import TableRow from './TableRow.js';
// Importing the TableRow component from the 'TableRow.js' file.


// utils.js contains a set of utility functions used for data manipulation and sorting in the application.
import { calculatePer1000, PageButton, getColumnOptions, sortData } from './utils.js';
// Function to calculate values per 1000 population, create pagination buttons, generate column options, and sort data.


// './styles.css' is an external stylesheet providing additional styles for the application.
import './styles.css';


const App = () => {

    // useState is a React hook that allows functional components to manage state.
    // It returns an array with two elements: the current state value and a function to update it.
    // The initial state is passed as an argument to useState.

    const [currentPage, setCurrentPage] = useState(1);
    // Manages the current page number in the pagination.

    const [itemsPerPage, setItemsPerPage] = useState(10);
    // Manages the number of items to display per page in the data table.

    const [maxPageButtons] = useState(5);
    // Represents the maximum number of page buttons to display in the pagination UI.

    const [selectedCountry, setSelectedCountry] = useState('');
    // Manages the selected country for filtering the data.

    const [startDate, setStartDate] = useState(null);
    // Manages the start date for filtering the data.
    const [endDate, setEndDate] = useState(null);
    // Manages the end date for filtering the data.

    const [minDate, setMinDate] = useState(null);
    // Represents the minimum date available in the dataset.
    const [maxDate, setMaxDate] = useState(null);
    // Represents the maximum date available in the dataset.

    const [selectedColumn, setSelectedColumn] = useState(null);
    // Manages the selected column for sorting and filtering the data.
    const [minValue, setMinValue] = useState('');
    // Manages the minimum value for filtering the data.
    const [maxValue, setMaxValue] = useState('');
    // Manages the maximum value for filtering the data.

    const [selectedTab, setSelectedTab] = useState('Table');
    // Manages the selected tab ('Table' or 'Chart') for displaying data.

    const [SumCovidData, setSumCovidData] = useState([]);
    // Stores aggregated COVID-19 data for efficient rendering.

    const [sortDirection, setSortDirection] = useState('asc');
    // Manages the sorting direction ('asc' or 'desc') for the data table.

    const [sortedColumn, setSortedColumn] = useState(null);
    // Manages the currently sorted column in the data table.

    const [allData, setAllData] = useState([]);
    // Stores all the retrieved COVID-19 data for various calculations and display.


    // getColumnOptions is a utility function defined in 'utils.js'.
    // It generates an array of column options used for the dropdown menu to select columns in the data table.
    const columnOptions = getColumnOptions();
    // Retrieves the array of column options for filtering and sorting data.
    // These options typically include columns such as 'cases', 'deaths', 'totalCases', 'totalDeaths', etc.


    // useEffect is a React hook that performs side effects in functional components.
    // It is commonly used for data fetching, subscriptions, or manually changing the DOM.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://opendata.ecdc.europa.eu/covid19/casedistribution/json/');
                // Makes an asynchronous HTTP request to retrieve COVID-19 data from the specified URL.

                const records = response.data.records;
                // Extracts the 'records' array from the response data containing COVID-19 data.

                const totalCases = {};
                // Object to store the total number of cases for each country.
                const totalDeaths = {};
                // Object to store the total number of deaths for each country.


                // Iterates through each record in the 'records' array and processes the data.

                records.forEach((record) => {
                    // Extracts relevant information from each record.

                    var country = record.countriesAndTerritories;
                    // Retrieves the name of the country.

                    var cases = record.cases;
                    // Retrieves the number of COVID-19 cases.
                    var deaths = record.deaths;
                    // Retrieves the number of COVID-19 deaths.

                    var date = record.dateRep;
                    // Retrieves the date of the record.

                    var casesPer1000 = calculatePer1000(record, false).numericValue.toFixed(5);
                    // Calculates cases per 1000 people using a utility function and rounds it to 5 decimal places.
                    var deathsPer1000 = calculatePer1000(record, true).numericValue.toFixed(5);
                    // Calculates deaths per 1000 people using a utility function and rounds it to 5 decimal places.

                    if (totalCases[country]) {
                        totalCases[country] += cases;
                    } else {
                        totalCases[country] = cases;
                    }
                    // Updates the total cases for the specific country.

                    if (totalDeaths[country]) {
                        totalDeaths[country] += deaths;
                    } else {
                        totalDeaths[country] = deaths;
                    }
                    // Updates the total deaths for the specific country.

                    var newData = {
                        country: country,
                        cases: cases,
                        deaths: deaths,
                        casesPer1000: casesPer1000,
                        deathsPer1000: deathsPer1000,
                        date: date,
                        totalCases: 0,
                        totalDeaths: 0,
                        averageCases: 0,
                        averageDeaths: 0,
                        maxCases: 0,
                        maxDeaths: 0,
                    };
                    // Creates a new data object with processed information.

                    allData.push(newData);
                    // Adds the new data object to the 'allData' array.
                });

                // Aggregates data by date and performs additional data processing.
                const aggregatedData = aggregateDataByDate(records);
                // Aggregates the data by date using a utility function.

                setSumCovidData(aggregatedData);
                // Sets the state 'SumCovidData' with the aggregated data.

                allData.forEach((data) => {
                    data.totalCases = totalCases[data.country];
                    data.totalDeaths = totalDeaths[data.country];
                });
                // Updates 'totalCases' and 'totalDeaths' properties in the 'allData' array.

                const dates = records.map((record) => {
                    const [day, month, year] = record.dateRep.split('/');
                    return new Date(`${month}/${day}/${year}`);
                });
                // Extracts dates from records and converts them to Date objects.

                setMinDate(new Date(Math.min(...dates)));
                // Sets the state 'minDate' with the minimum date from the data(const).
                setMaxDate(new Date(Math.max(...dates)));
                // Sets the state 'maxDate' with the maximum date from the data(const).

                setStartDate(new Date(Math.min(...dates)));
                // Sets the state 'startDate' with the minimum date from the data.
                setEndDate(new Date(Math.max(...dates)));
                // Sets the state 'endDate' with the maximum date from the data.


                // Creates a dictionary to store daily cases and deaths data for each date.

                const dailyData = {};
                records.forEach((record) => {
                    const date = record.dateRep;
                    const dailyCases = record.cases;
                    const dailyDeaths = record.deaths;

                    if (dailyData[date]) {
                        // If the date entry already exists, append daily cases and deaths.
                        dailyData[date].dailyCases.push(dailyCases);
                        dailyData[date].dailyDeaths.push(dailyDeaths);
                    } else {
                        // If the date entry does not exist, create a new entry.
                        dailyData[date] = {
                            dailyCases: [dailyCases],
                            dailyDeaths: [dailyDeaths],
                        };
                    }
                });

                // Calculates daily averages and maximums for cases and deaths, and updates the 'allData' state.

                Object.keys(dailyData).forEach((date) => {
                    const casesArray = dailyData[date].dailyCases;
                    const deathsArray = dailyData[date].dailyDeaths;

                    // Calculate average cases and deaths for the date.
                    const averageCases = (casesArray.reduce((sum, cases) => sum + cases, 0) / casesArray.length).toFixed(4);
                    const averageDeaths = (deathsArray.reduce((sum, deaths) => sum + deaths, 0) / deathsArray.length).toFixed(4);

                    // Find the maximum cases and deaths for the date.
                    const maxCases = Math.max(...casesArray).toFixed(4);
                    const maxDeaths = Math.max(...deathsArray).toFixed(4);

                    // Update the 'allData' array with the calculated values.
                    allData.forEach((data) => {
                        if (data.date === date) {
                            data.averageCases = averageCases;
                            data.averageDeaths = averageDeaths;
                            data.maxCases = maxCases;
                            data.maxDeaths = maxDeaths;
                        }
                    });
                });

                // Set the updated 'allData' state.
                setAllData(allData);
            } catch (error) {
                // Log an error message if there is an issue fetching the data.
                console.error('Error fetching data:', error);
            }

        };
        // Invoke the fetchData function when the component mounts (empty dependency array).
        fetchData();
    }, []);


    // Function to reset filters and pagination
    const resetFilters = () => {
        // Reset selected country filter
        setSelectedCountry('');

        // Reset selected column for sorting
        setSelectedColumn(null);
        // Reset min and max values for custom filtering
        setMinValue('');
        setMaxValue('');

        // Reset items per page and current page for pagination
        setItemsPerPage(10);
        setCurrentPage(1);
    };


    // Function to get unique countries from the data
    const getUniqueCountries = () => {
        // Create a Set to store unique country names
        const uniqueCountriesSet = new Set(allData.map(record => record.country));
        // Convert the Set to an Array
        const uniqueCountriesArray = Array.from(uniqueCountriesSet);

        // Map the unique country names to an array of objects with 'value' and 'label' properties
        return uniqueCountriesArray.map(country => ({
            value: country,
            label: country
        }));
    };


    // Get unique countries from the data
    const uniqueCountries = getUniqueCountries();


    // Filter data based on selected filters
    const filteredData = allData.filter(entry => {
        // Clean and lowercase country names for comparison
        const cleanedCountry = entry.country.trim().toLowerCase();
        const selectedCountryLower = selectedCountry.toLowerCase();

        // Check if the country matches the selected country filter
        const countryMatches = !selectedCountry || cleanedCountry === selectedCountryLower;

        // Parse entry date and check if it falls within the selected date range
        const entryDate = new Date(entry.date);
        const isDateValid = !isNaN(entryDate.getTime()) &&
            (!startDate || isNaN(startDate.getTime()) || entryDate >= startDate) &&
            (!endDate || isNaN(endDate.getTime()) || entryDate <= endDate);

        // Check if the entry's value for the selected column falls within the specified range
        const isValueValid = selectedColumn && selectedColumn.value
            ? (entry[selectedColumn.value] !== undefined && entry[selectedColumn.value] !== null)
            && (minValue === '' || entry[selectedColumn.value] >= parseFloat(minValue))
            && (maxValue === '' || entry[selectedColumn.value] <= parseFloat(maxValue))
            : true;

        // Include the entry in the filtered data if it satisfies all conditions
        return countryMatches && isDateValid && isValueValid;
    });


    // Determine the total pages required for the paginated display,
    // accounting for the specified items per page.
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);


    // Generate an array of page numbers for pagination based on the current page, total pages,
    // and the maximum number of page buttons to display.
    const renderPageNumbers = () => {
        // Initialize an array to store page numbers and calculate half of the maximum page buttons
        const pageNumbers = [];
        const halfButtons = Math.floor(maxPageButtons / 2);

        // Calculate the start and end page numbers based on the current page and half of the maximum page buttons
        let startPage = currentPage - halfButtons;
        let endPage = currentPage + halfButtons;

        // Adjust startPage and endPage to fit within valid page numbers
        if (startPage <= 0) {
            startPage = 1;
            endPage = Math.min(maxPageButtons, totalPages);
        }
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, totalPages - maxPageButtons + 1);
        }

        // Display "<<", "..." if necessary to navigate to the first page
        if (startPage > 1) {
            pageNumbers.push(
                <PageButton key={1} label={'<<'} onClick={() => paginate(1)} buttonType="double-arrow" />
            );

            // Add an ellipsis button if the start page is greater than 2
            if (startPage > 2) {
                pageNumbers.push(
                    <PageButton
                        key="left-dots"
                        label={'...'}
                        onClick={() => paginate(startPage - 1)}
                        buttonType="ellipsis"
                    />
                );
            }
        }

        // Display page numbers within the valid range
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <PageButton
                    key={i}
                    label={i}
                    onClick={() => paginate(i)}
                    buttonType={i === currentPage ? "current" : "normal"}
                />
            );
        }

        // Display "..." and ">>" if necessary to navigate to the last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(
                    <PageButton
                        key="right-dots"
                        label={'...'}
                        onClick={() => paginate(endPage + 1)}
                        buttonType="ellipsis"
                    />
                );
            }
            pageNumbers.push(
                <PageButton
                    key={totalPages}
                    label={'>>'}
                    onClick={() => paginate(totalPages)}
                    buttonType="double-arrow"
                />
            );
        }

        // Return the array of page number buttons
        return pageNumbers;
    };


    // Set the current page to the specified page number
    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    // Aggregate data by date, summing up total cases and total deaths for each date
    const aggregateDataByDate = (data) => {
        // Initialize an object to store aggregated data
        const aggregatedData = {};

        // Aggregate data by date
        data.forEach((record) => {
            const date = record.dateRep;

            // Check if the date already exists in the aggregatedData object
            if (aggregatedData[date]) {
                // If yes, update the totalCases and totalDeaths for that date
                aggregatedData[date].totalCases += record.cases;
                aggregatedData[date].totalDeaths += record.deaths;
            } else {
                // If no, create a new entry for that date with totalCases and totalDeaths
                aggregatedData[date] = {
                    date,
                    totalCases: record.cases,
                    totalDeaths: record.deaths,
                };
            }
        });

        // Return the values of the aggregatedData object as an array
        return Object.values(aggregatedData);
    };


    // Sort the filteredData based on the selected column and sort direction
    var sortedFilteredData = sortData(filteredData, sortedColumn, sortDirection);


    // Handle sorting of the table based on the selected column
    const handleColumnSort = (column) => {
        if (sortedColumn === column) {
            // If the same column is clicked, toggle between ascending and descending order
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // If a different column is clicked, set it as the new sortedColumn and set the sort direction to ascending
            setSortedColumn(column);
            setSortDirection('asc');
        }
    };


    // Handle the change in the number of items displayed per page
    const handleItemsPerPageChange = (e) => {
        // Parse the selected value as an integer
        const selectedValue = parseInt(e.target.value, 10);

        // Set the new itemsPerPage and reset the currentPage to 1
        setItemsPerPage(selectedValue);
        setCurrentPage(1);

        // Display a warning if a large number of items per page is selected
        if (selectedValue > 1000) {
            alert('Warning: Large number of items per page may cause performance issues.');
        }
    };


    // Handle the change in the minimum value filter
    const handleMinValueChange = (e) => {
        // Set the new minimum value and reset the currentPage to 1
        setMinValue(e.target.value);
        setCurrentPage(1);
    };

    // Handle the change in the maximum value filter
    const handleMaxValueChange = (e) => {
        // Set the new maximum value and reset the currentPage to 1
        setMaxValue(e.target.value);
        setCurrentPage(1);
    };


    return (
        <div className="App">
            <div className="CovidData">
                {/* Date Picker Block */}
                <div className="DatePickerBlock">
                    {/* Start Date Picker */}
                    <div className="datePickerField">
                        <label htmlFor="startDatePicker">Start Date:</label>
                        <DatePicker
                            id="startDatePicker"
                            selected={startDate}
                            onChange={(date) => {
                                // Set the new start date and reset the currentPage to 1
                                setStartDate(date);
                                setCurrentPage(1);
                            }}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            minDate={minDate}
                            maxDate={endDate}
                            dateFormat="dd/MM/yyyy"
                        />
                    </div>
                    {/* End Date Picker */}
                    <div className="datePickerField">
                        <label htmlFor="endDatePicker">End Date:</label>
                        <DatePicker
                            id="endDatePicker"
                            selected={endDate}
                            onChange={(date) => {
                                // Set the new end date and reset the currentPage to 1
                                setEndDate(date);
                                setCurrentPage(1);
                            }}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            maxDate={maxDate}
                            dateFormat="dd/MM/yyyy"
                        />
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="TabSwitcher">
                    {/* Table Button */}
                    <button
                        className={`TableButton ${selectedTab === 'Table' ? 'PageButtonCurrent' : 'PageButtonNormal'}`}
                        onClick={() => setSelectedTab('Table')}
                    >
                        Table
                    </button>
                    {/* Chart Button */}
                    <button
                        className={`ChartButton ${selectedTab === 'Chart' ? 'PageButtonCurrent' : 'PageButtonNormal'}`}
                        onClick={() => setSelectedTab('Chart')}
                    >
                        Graph
                    </button>
                </div>

                {/* Chart Page */}
                <div className="ChartPage">
                    {/* Conditional Rendering based on selectedTab */}
                    {selectedTab === 'Table' ? (
                        <>
                            {/* Render Table Component */}
                            <div className="filterContainer">
                                {/* Filter Column */}
                                <div className="filterColumn">
                                    {/* Select Component for Country Input */}
                                    <Select
                                        id="countryInput"
                                        value={uniqueCountries.find((country) => country.value === selectedCountry) || null}
                                        onChange={(selectedOption) => {
                                            setSelectedCountry(selectedOption.value);
                                            setCurrentPage(1);
                                        }}
                                        options={getUniqueCountries()}
                                        isSearchable
                                        getOptionLabel={(option) => option.label}
                                        getOptionValue={(option) => option.value}
                                        placeholder="Search country..."
                                        className="selectStyle"
                                        classNamePrefix="selectPrefix"
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                borderRadius: '5px',
                                            }),
                                            noOptionsMessage: (provided) => ({
                                                ...provided,
                                                color: '#ff6347',
                                                backgroundColor: '#ffe4e1',
                                            }),
                                        }}
                                        noOptionsMessage={() => "No options available"}
                                    />
                                </div>
                                {/* Filter Column for Column Selection */}
                                <div className="filterColumn">
                                    {/* Select Component for Column Selection */}
                                    <Select
                                        id="columnSelect"
                                        value={selectedColumn}
                                        onChange={(selectedOption) => {
                                            setSelectedColumn(selectedOption);
                                            setCurrentPage(1);
                                        }}
                                        options={columnOptions}
                                        isSearchable
                                        placeholder="Search column..."
                                        className="selectStyle"
                                        classNamePrefix="selectPrefix"
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                borderRadius: '5px',
                                            }),
                                            noOptionsMessage: (provided) => ({
                                                ...provided,
                                                color: '#ff6347',
                                                backgroundColor: '#ffe4e1',
                                            }),
                                        }}
                                        noOptionsMessage={() => "No options available"}
                                    />
                                </div>
                                {/* Filter Column for Min/Max Value Input */}
                                <div className="filterColumn">
                                    {/* Min Value Input */}
                                    <input
                                        type="number"
                                        id="minValue"
                                        placeholder="Min Value"
                                        value={minValue}
                                        onChange={(e) => {
                                            handleMinValueChange(e);
                                            setCurrentPage(1);
                                        }}
                                        className="filterInput"
                                    />
                                    {/* Max Value Input */}
                                    <input
                                        type="number"
                                        id="maxValue"
                                        placeholder="Max Value"
                                        value={maxValue}
                                        onChange={(e) => {
                                            handleMaxValueChange(e);
                                            setCurrentPage(1);
                                        }}
                                        className="filterInput"
                                    />
                                </div>
                            </div>

                            {/* Reset Filters Button */}
                            <button className="resetButton" onClick={resetFilters}>
                                Reset Filters
                            </button>

                            <div>
                                <table className="dataTable">
                                    {/* Table Header */}
                                    <thead>
                                        <tr>
                                            <th className="sortableHeader" onClick={() => handleColumnSort('country')}>Country</th>
                                            <th className="sortableHeader" onClick={() => handleColumnSort('cases')}>Cases</th>
                                            <th className="sortableHeader" onClick={() => handleColumnSort('deaths')}>Deaths</th>
                                            <th className="sortableHeader" onClick={() => handleColumnSort('totalCases')}>Total Cases</th>
                                            <th className="sortableHeader" onClick={() => handleColumnSort('totalDeaths')}>Total Deaths</th>
                                            <th className="sortableHeader" onClick={() => handleColumnSort('casesPer1000')}>Cases per 1000</th>
                                            <th className="sortableHeader" onClick={() => handleColumnSort('deathsPer1000')}>Deaths per 1000</th>
                                            <th className="sortableHeader" onClick={() => handleColumnSort('averageCases')}>Avg Cases/Day</th>
                                            <th className="sortableHeader" onClick={() => handleColumnSort('averageDeaths')}>Avg Deaths/Day</th>
                                            <th className="sortableHeader" onClick={() => handleColumnSort('maxCases')}>Max Cases/Day</th>
                                            <th className="sortableHeader" onClick={() => handleColumnSort('maxDeaths')}>Max Deaths/Day</th>
                                        </tr>
                                    </thead>

                                    {/* Table Body */}
                                    <tbody className="dataBody">
                                        {sortedFilteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((data, index) => (
                                            <TableRow key={index} data={data} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Items Per Page Input */}
                            <input
                                type="number"
                                id="itemsPerPage"
                                onChange={handleItemsPerPageChange}
                                placeholder="Items per page..."
                                min="1"
                                className="itemsPerPageInput"
                            />

                            {/* Pagination Container */}
                            <div className="paginationContainer">
                                {renderPageNumbers()}
                            </div>
                        </>
                    ) : (
                        //Chart Component
                        <ChartComponent
                            startDate={startDate}
                            endDate={endDate}
                            covidData={SumCovidData}
                            countryList={uniqueCountries}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// Exporting the 'App' component as the default export of this module.
export default App;
