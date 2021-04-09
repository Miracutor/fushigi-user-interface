import React from "react";
import "../../css/cheatsheet.css";

const CheatSheet = () => {
  return (
    <div className="cheat-card">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Cheat Sheet</h5>
          <h6 className="card-subtitle mb-2 text-muted">
            Quick guide to get started using the system
          </h6>
          <ul className="list-group card-text">
            <li className="list-group-item">
              <h6>What...?</h6>
              <p className="small">
                Ask the explanation of many things related to the CS School such
                as the current Dean, computer science meaning or major subjects.
              </p>
            </li>
            <li className="list-group-item">
              <h6>Where...?</h6>
              <p className="small">
                Ask the direction to many places in the CS School such as Dean's
                Office, School Office or Surau.
              </p>
            </li>
            <li className="list-group-item">
              <h6>Why / How...?</h6>
              <p className="small">
                Inquiry about many subjects about the CS School such as the
                reasoning behind internship programme, graduate requirements or
                and others.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CheatSheet;
