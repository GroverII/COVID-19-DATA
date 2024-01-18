export const calculatePer1000 = (data, forDeaths = false) => {
    const value = forDeaths ? data.deaths : data.cases;

    if (!data || value === 0 || data.popData2019 === null) {
        return {
            numericValue: 0,
            displayValue: '0',
        };
    }

    const per1000 = value / (data.popData2019 / 1000);
    const numericValue = isFinite(per1000) ? per1000 : 0.0001;
    const displayValue = isFinite(per1000) ? (per1000 < 0.0001 ? '<0.0001' : per1000.toFixed(4)) : '0';

    return {
        numericValue,
        displayValue,
    };
};

export const PageButton = ({ label, onClick, buttonType }) => {
    const buttonClasses = `button ${buttonType}`;

    return (
        <button
            className={buttonClasses}
            onClick={onClick}
        >
            {label}
        </button>
    );
};
export const getColumnOptions = () => {
    const columns = ['cases', 'deaths', 'totalCases', 'totalDeaths', 'casesPer1000', 'deathsPer1000', 'averageCases', 'averageDeaths', 'maxCases', 'maxDeaths'];
    return columns.map(column => ({ value: column, label: column }));
};

export const sortData = (data, column, direction) => {
    const sortedData = [...data];

    sortedData.sort((a, b) => {
        let valueA, valueB;
        switch (column) {
            case 'country':
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
                valueA = isNaN(a[column]) ? parseFloat(a[column]) || 0 : +a[column];
                valueB = isNaN(b[column]) ? parseFloat(b[column]) || 0 : +b[column];
                break;
            default:
                valueA = String(a[column] || '');
                valueB = String(b[column] || '');
        }
        const comparison = isNaN(valueA) || isNaN(valueB) ? valueA.localeCompare(valueB) : valueA - valueB;

        return direction === 'asc' ? comparison : -comparison;
    });

    return sortedData;
};

