import './styles.css';

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

export default TableRow;
