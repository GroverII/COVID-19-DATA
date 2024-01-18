// Importing a CSS file for styling.
import './styles.css';

/**
 * TableRow component represents a row in the data table.
 *
 * @param {Object} data - An object containing data for a specific row.
 * @returns {JSX.Element} - A React element representing the table row.
 */
const TableRow = ({ data }) => {
    return (
        <tr style={{ borderBottom: '5px solid #ddd' }}>
            <td>{data.country}</td>
            <td>{data.cases}</td>
            <td>{data.deaths}</td>
            <td>{data.totalCases}</td>
            <td>{data.totalDeaths}</td>
            <td>{data.casesPer1000}</td>
            <td>{data.deathsPer1000}</td>
            <td>{data.averageCases}</td>
            <td>{data.averageDeaths}</td>
            <td>{data.maxCases}</td>
            <td>{data.maxDeaths}</td>
        </tr>
    );
};

// Exporting the TableRow component as the default export of this module.
export default TableRow;
