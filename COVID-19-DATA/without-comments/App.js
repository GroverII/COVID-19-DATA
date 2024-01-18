import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import ChartComponent from './Chart.js';
import TableRow from './TableRow.js';
import { calculatePer1000, PageButton, getColumnOptions, sortData } from './utils.js';
import './styles.css';


const App = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [maxPageButtons] = useState(5);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [minDate, setMinDate] = useState(null);
    const [maxDate, setMaxDate] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState(null);
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');
    const [selectedTab, setSelectedTab] = useState('Table');
    const [SumCovidData, setSumCovidData] = useState([]);
    const [sortDirection, setSortDirection] = useState('asc');
    const [sortedColumn, setSortedColumn] = useState(null);
    const [allData, setAllData] = useState([]);

    const columnOptions = getColumnOptions();


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://opendata.ecdc.europa.eu/covid19/casedistribution/json/');
                const records = response.data.records;
                const totalCases = {};
                const totalDeaths = {};



                records.forEach((record) => {
                    var country = record.countriesAndTerritories;
                    var cases = record.cases;
                    var deaths = record.deaths;
                    var date = record.dateRep;
                    var casesPer1000 = calculatePer1000(record, false).numericValue.toFixed(5);
                    var deathsPer1000 = calculatePer1000(record, true).numericValue.toFixed(5);

                    if (totalCases[country]) {
                        totalCases[country] += cases;
                    } else {
                        totalCases[country] = cases;
                    }

                    if (totalDeaths[country]) {
                        totalDeaths[country] += deaths;
                    } else {
                        totalDeaths[country] = deaths;
                    }

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

                    allData.push(newData);
                });

                const aggregatedData = aggregateDataByDate(records);

                setSumCovidData(aggregatedData);

                allData.forEach((data) => {
                    data.totalCases = totalCases[data.country];
                    data.totalDeaths = totalDeaths[data.country];
                });

                const dates = records.map((record) => {
                    const [day, month, year] = record.dateRep.split('/');
                    return new Date(`${month}/${day}/${year}`);
                });

                setMinDate(new Date(Math.min(...dates)));
                setMaxDate(new Date(Math.max(...dates)));
                setStartDate(new Date(Math.min(...dates)));
                setEndDate(new Date(Math.max(...dates)));

                const dailyData = {};
                records.forEach((record) => {
                    const date = record.dateRep;
                    const dailyCases = record.cases;
                    const dailyDeaths = record.deaths;

                    if (dailyData[date]) {
                        dailyData[date].dailyCases.push(dailyCases);
                        dailyData[date].dailyDeaths.push(dailyDeaths);
                    } else {
                        dailyData[date] = {
                            dailyCases: [dailyCases],
                            dailyDeaths: [dailyDeaths],
                        };
                    }
                });


                Object.keys(dailyData).forEach((date) => {
                    const casesArray = dailyData[date].dailyCases;
                    const deathsArray = dailyData[date].dailyDeaths;

                    const averageCases = (casesArray.reduce((sum, cases) => sum + cases, 0) / casesArray.length).toFixed(4);
                    const averageDeaths = (deathsArray.reduce((sum, deaths) => sum + deaths, 0) / deathsArray.length).toFixed(4);

                    const maxCases = Math.max(...casesArray).toFixed(4);
                    const maxDeaths = Math.max(...deathsArray).toFixed(4);

                    allData.forEach((data) => {
                        if (data.date === date) {
                            data.averageCases = averageCases;
                            data.averageDeaths = averageDeaths;
                            data.maxCases = maxCases;
                            data.maxDeaths = maxDeaths;
                        }
                    });
                });

                setAllData(allData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }

        };
        fetchData();
    }, []);


    const resetFilters = () => {
        setSelectedCountry('');

        setSelectedColumn(null);
        setMinValue('');
        setMaxValue('');

        setItemsPerPage(10);
        setCurrentPage(1);
    };


    const getUniqueCountries = () => {
        const uniqueCountriesSet = new Set(allData.map(record => record.country));
        const uniqueCountriesArray = Array.from(uniqueCountriesSet);

        return uniqueCountriesArray.map(country => ({
            value: country,
            label: country
        }));
    };


    const uniqueCountries = getUniqueCountries();


    const filteredData = allData.filter(entry => {
        const cleanedCountry = entry.country.trim().toLowerCase();
        const selectedCountryLower = selectedCountry.toLowerCase();

        const countryMatches = !selectedCountry || cleanedCountry === selectedCountryLower;

        const entryDate = new Date(entry.date);
        const isDateValid = !isNaN(entryDate.getTime()) &&
            (!startDate || isNaN(startDate.getTime()) || entryDate >= startDate) &&
            (!endDate || isNaN(endDate.getTime()) || entryDate <= endDate);

        const isValueValid = selectedColumn && selectedColumn.value
            ? (entry[selectedColumn.value] !== undefined && entry[selectedColumn.value] !== null)
            && (minValue === '' || entry[selectedColumn.value] >= parseFloat(minValue))
            && (maxValue === '' || entry[selectedColumn.value] <= parseFloat(maxValue))
            : true;

        return countryMatches && isDateValid && isValueValid;
    });


    const totalPages = Math.ceil(filteredData.length / itemsPerPage);


    const renderPageNumbers = () => {
        const pageNumbers = [];
        const halfButtons = Math.floor(maxPageButtons / 2);

        let startPage = currentPage - halfButtons;
        let endPage = currentPage + halfButtons;

        if (startPage <= 0) {
            startPage = 1;
            endPage = Math.min(maxPageButtons, totalPages);
        }
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, totalPages - maxPageButtons + 1);
        }

        if (startPage > 1) {
            pageNumbers.push(
                <PageButton key={1} label={'<<'} onClick={() => paginate(1)} buttonType="double-arrow" />
            );

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

        return pageNumbers;
    };


    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    const aggregateDataByDate = (data) => {
        const aggregatedData = {};

        data.forEach((record) => {
            const date = record.dateRep;

            if (aggregatedData[date]) {
                aggregatedData[date].totalCases += record.cases;
                aggregatedData[date].totalDeaths += record.deaths;
            } else {
                aggregatedData[date] = {
                    date,
                    totalCases: record.cases,
                    totalDeaths: record.deaths,
                };
            }
        });
        return Object.values(aggregatedData);
    };


    var sortedFilteredData = sortData(filteredData, sortedColumn, sortDirection);


    const handleColumnSort = (column) => {
        if (sortedColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortedColumn(column);
            setSortDirection('asc');
        }
    };


    const handleItemsPerPageChange = (e) => {
        const selectedValue = parseInt(e.target.value, 10);

        setItemsPerPage(selectedValue);
        setCurrentPage(1);

        if (selectedValue > 1000) {
            alert('Warning: Large number of items per page may cause performance issues.');
        }
    };


    const handleMinValueChange = (e) => {
        setMinValue(e.target.value);
        setCurrentPage(1);
    };

    const handleMaxValueChange = (e) => {
        setMaxValue(e.target.value);
        setCurrentPage(1);
    };


    return (
        <div className="App">
            <div className="CovidData">
                <div className="DatePickerBlock">
                    <div className="datePickerField">
                        <label htmlFor="startDatePicker">Start Date:</label>
                        <DatePicker
                            id="startDatePicker"
                            selected={startDate}
                            onChange={(date) => {
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
                    <div className="datePickerField">
                        <label htmlFor="endDatePicker">End Date:</label>
                        <DatePicker
                            id="endDatePicker"
                            selected={endDate}
                            onChange={(date) => {
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
                <div className="TabSwitcher">
                    <button
                        className={`TableButton ${selectedTab === 'Table' ? 'PageButtonCurrent' : 'PageButtonNormal'}`}
                        onClick={() => setSelectedTab('Table')}
                    >
                        Table
                    </button>
                    <button
                        className={`ChartButton ${selectedTab === 'Chart' ? 'PageButtonCurrent' : 'PageButtonNormal'}`}
                        onClick={() => setSelectedTab('Chart')}
                    >
                        Graph
                    </button>
                </div>
                <div className="ChartPage">
                    {selectedTab === 'Table' ? (
                        <>
                            <div className="filterContainer">
                                <div className="filterColumn">
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
                                <div className="filterColumn">
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
                                <div className="filterColumn">
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
                            <button className="resetButton" onClick={resetFilters}>
                                Reset Filters
                            </button>

                            <div>
                                <table className="dataTable">
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
                                    <tbody className="dataBody">
                                        {sortedFilteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((data, index) => (
                                            <TableRow key={index} data={data} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <input
                                type="number"
                                id="itemsPerPage"
                                onChange={handleItemsPerPageChange}
                                placeholder="Items per page..."
                                min="1"
                                className="itemsPerPageInput"
                            />
                            <div className="paginationContainer">
                                {renderPageNumbers()}
                            </div>
                        </>
                    ) : (
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

export default App;
