import React, { useEffect, useState } from 'react';
import '../Styles/style.css';

export default function Table() {
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    // Fetch data when the component mounts
    fetch('https://api.nobelprize.org/v1/prize.json')
      .then(response => response.json())
      .then(data => setRecords(data.prizes)) // Extract the prizes array from the data
      .catch(err => console.log(err));
  }, []); // Empty dependency array to ensure the effect runs only once on mount

  // Calculate indexes for the current page
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Filter records based on selected category and year
  const filteredRecords = records.filter((prize) => {
    return (
      (selectedCategory === '' || prize.category === selectedCategory) &&
      (selectedYear === '' || prize.year === selectedYear)
    );
  });

  // Get unique years and categories for dropdown options
  const uniqueYears = Array.from(new Set(records.map((prize) => prize.year))).sort();
  // Filter unique categories
  const uniqueCategories = Array.from(new Set(records.map((prize) => prize.category)));



  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const maxPagesToShow = 3;

  // Function to generate pagination items
  const renderPaginationItems = () => {
    const paginationItems = [];

    // Previous button
    paginationItems.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button onClick={() => paginate(currentPage - 1)} className="page-link">Previous</button>
      </li>
    );

    // Page numbers
    for (let page = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      page <= Math.min(totalPages, currentPage + Math.floor(maxPagesToShow / 2));
      page++) {
      paginationItems.push(
        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
          <button onClick={() => paginate(page)} className="page-link">
            {page}
          </button>
        </li>
      );
    }

    // Next button
    paginationItems.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
        <button onClick={() => paginate(currentPage + 1)} className="page-link">Next</button>
      </li>
    );

    return paginationItems;
  };

  // Identify laureates who have won the Nobel Prize more than once
  const multipleTimeWinners = records.reduce((winners, prize) => {
    if (prize.laureates) {
      prize.laureates.forEach((laureate) => {
        const existingWinner = winners.find((winner) => winner.id === laureate.id);
        if (existingWinner) {
          existingWinner.wins += 1;
        } else {
          winners.push({
            id: laureate.id,
            firstname: laureate.firstname,
            surname: laureate.surname,
            wins: 1,
          });
        }
      });
    }
    return winners;
  }, []).filter((winner) => winner.wins > 1);


  return (
    <>
      <div className="sidebar-wrapper">
        {/* Dropdown for selecting the category */}
        <div className="dropdown-wrapper">
          <div className="form-group">
            <label htmlFor="category">Select Category:</label>
            <select
              id="category"
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown for selecting the year */}
          <div className="form-group">
            <label htmlFor="year">Select Year:</label>
            <select
              id="year"
              className="form-control"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <a href="#" data-toggle="modal" data-target="#createRiskModal">
            <div className="card show-people">
              <h6>People who have won the Nobel prize more than 1 time</h6>
              <button className='btn btn-success'>Details</button>
            </div>
          </a>
        </div>
      </div>


      <div className="content-wrapper">
        <div className="header">
          <h3>NOBLE PRIZE WINNERS LIST</h3>
        </div>
        <div className="main-content">

          {/* Display filtered records */}
          <div className="table-responsive prize-table">
            <table className="table" id="resource-Table">
              <thead>
                <tr>
                  
                  <th scope="col">Year</th>
                  <th scope="col">Category</th>
                  <th scope="col">Motivation</th>
                  <th scope="col">Laureates</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord).map((prize, index) => (
                  <tr key={index}>
                    
                    <td>{prize.year}</td>
                    <td>{prize.category}</td>
                    <td className='motivation'>
                      {prize.laureates && prize.laureates.length > 0 && (
                        <div>{prize.laureates[0].motivation}</div>
                      )}
                    </td>
                    <td className='laureates'>
                      {prize.laureates && prize.laureates.map((laureate) => (
                        <span key={laureate.id}>
                          {laureate.firstname} {laureate.surname},
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <center> <div className="pagination">
            <ul className="pagination">
              {renderPaginationItems()}
            </ul>
          </div>
          </center>
        </div>
      </div>


      {/*model*/}
      <div class="modal fade" id="createRiskModal" tabindex="-1" role="dialog" aria-labelledby="createRiskModalLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div class="modal-content details-model">
          <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
              {multipleTimeWinners.length > 0 && (
                <div className="multiple-winners">
                  <h3>Multiple-Time Nobel Prize Winners</h3>
                  <table className="table">
                    <thead>
                      <tr>
                        
                        <th>ID</th>
                        <th>Firstname</th>
                        <th>Surname</th>
                        <th>Wins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {multipleTimeWinners.map((winner) => (
                        <tr key={winner.id}>
                          <td>{winner.id}</td>
                          <td>{winner.firstname}</td>
                          <td>{winner.surname}</td>
                          <td>{winner.wins}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
