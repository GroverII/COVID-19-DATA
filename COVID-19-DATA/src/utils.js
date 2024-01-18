/**
 * calculatePer1000 function calculates the number of cases or deaths per 1000 population.
 *
 * @param {Object} data - An object containing data for a specific record.
 * @param {boolean} forDeaths - A flag indicating whether to calculate for deaths (default is false).
 * @returns {Object} - An object containing the numeric and display values for per 1000 calculation.
 */
export const calculatePer1000 = (data, forDeaths = false) => {
    // Determine the value based on the forDeaths flag.
    const value = forDeaths ? data.deaths : data.cases;

    // Check if data is undefined, value is 0, or population data is null.
    if (!data || value === 0 || data.popData2019 === null) {
        return {
            numericValue: 0,
            displayValue: '0',
        };
    }

    // Calculate per 1000 based on population data.
    const per1000 = value / (data.popData2019 / 1000);

    // Handle edge case for very small values.
    const numericValue = isFinite(per1000) ? per1000 : 0.0001;
    // Format display value with 4 decimal places or '<0.0001' for very small values.
    const displayValue = isFinite(per1000) ? (per1000 < 0.0001 ? '<0.0001' : per1000.toFixed(4)) : '0';

    // Return an object containing numeric and display values.
    return {
        numericValue,
        displayValue,
    };
};


/**
 * PageButton component represents a button for pagination with specified label, onClick event,
 * and button type.
 *
 * @param {Object} props - The properties of the PageButton component.
 * @param {string} props.label - The label/text displayed on the button.
 * @param {function} props.onClick - The function to be executed on button click.
 * @param {string} props.buttonType - The type/style of the button.
 * @returns {JSX.Element} - The JSX element representing the PageButton component.
 */
export const PageButton = ({ label, onClick, buttonType }) => {
    // Generate button classes based on the specified buttonType.
    const buttonClasses = `button ${buttonType}`;

    // Render the button with the provided label and onClick event.
    return (
        <button
            className={buttonClasses}
            onClick={onClick}
        >
            {label}
        </button>
    );
};


/**
 * getColumnOptions function generates an array of options for columns.
 *
 * @returns {Array} - An array of objects representing column options, each with a value and label.
 */
export const getColumnOptions = () => {
    // Define an array of column names.
    const columns = ['cases', 'deaths', 'totalCases', 'totalDeaths', 'casesPer1000', 'deathsPer1000', 'averageCases', 'averageDeaths', 'maxCases', 'maxDeaths'];

    // Map the column names to an array of objects with value and label properties.
    return columns.map(column => ({ value: column, label: column }));
};


/**
 * sortData function sorts an array of objects based on a specified column and direction.
 *
 * @param {Array} data - The array of objects to be sorted.
 * @param {string} column - The column by which to sort the data.
 * @param {string} direction - The sorting direction, either 'asc' (ascending) or 'desc' (descending).
 * @returns {Array} sortedData - The sorted array of objects.
 */
export const sortData = (data, column, direction) => {
    // Create a shallow copy of the original data array.
    const sortedData = [...data];

    // Perform sorting based on the specified column and direction.
    sortedData.sort((a, b) => {
        // Switch statement to handle different data types for sorting columns.
        let valueA, valueB;

        switch (column) {
            case 'country':
                // For 'country' column, use string values.
                valueA = a[column] || '';
                valueB = b[column] || '';
                break;
            case 'totalCases':
            case 'totalDeaths':
            case 'casesPer1000':
            case 'deathsPer1000':
            case 'averageCases':
            case 'averageDeaths':
            case 'maxCases':
            case 'maxDeaths':
                // For numeric columns, convert to number, handling NaN gracefully.
                valueA = isNaN(a[column]) ? parseFloat(a[column]) || 0 : +a[column];
                valueB = isNaN(b[column]) ? parseFloat(b[column]) || 0 : +b[column];
                break;
            default:
                // For other columns, treat as strings.
                valueA = String(a[column] || '');
                valueB = String(b[column] || '');
        }

        // Compare values, considering numeric or string comparison based on data types.
        const comparison = isNaN(valueA) || isNaN(valueB) ? valueA.localeCompare(valueB) : valueA - valueB;

        // Return the comparison result, adjusting for sorting direction.
        return direction === 'asc' ? comparison : -comparison;
    });

    // Return the sorted array.
    return sortedData;
};


