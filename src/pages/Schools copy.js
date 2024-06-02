import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { FaSignOutAlt, FaEdit, FaTimesCircle } from "react-icons/fa";
import { HiDotsVertical, HiSearch } from "react-icons/hi";
import { IoMdAdd } from "react-icons/io";

const columns = [
  { id: "index", label: "No.", minWidth: 50 },
  { id: "name", label: "Name", minWidth: 170 },
  { id: "email", label: "Email", minWidth: 170 },
  { id: "licenses", label: "No. of Licenses", minWidth: 100, align: "center" },
  {
    id: "status",
    label: "",
    minWidth: 50,
    align: "center",
    format: (row) => (
      <span
        className={`inline-block w-3 h-3 rounded-full ${
          row.status === "active" ? "bg-green-500" : "bg-red-500"
        }`}
      ></span>
    ),
  },
  {
    id: "action",
    label: "Action",
    minWidth: 50,
    align: "left",
    format: (row, handleActionClick) => (
      <div ref={row.actionMenuRef}>
        <HiDotsVertical
          size={20}
          className="cursor-pointer"
          onClick={() => handleActionClick(row.id)}
        />
        <div className="relative" ref={row.actionMenuRef}>
          {row.actionMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
              <div className="p-2">
                {row.status === "active" ? (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      // Handle disable
                    }}
                  >
                    <FaTimesCircle className="mr-2 text-red-500" />
                    Disable
                  </button>
                ) : (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      // Handle activate
                    }}
                  >
                    <FaEdit className="mr-2 text-green-500" />
                    Activate
                  </button>
                )}
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    // Handle edit
                  }}
                >
                  <FaEdit className="mr-2 text-blue-500" />
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
  },
];

function createData(id, name, email, licenses, status) {
  return {
    id,
    name,
    email,
    licenses,
    status,
    actionMenuOpen: false,
    actionMenuRef: React.createRef(),
  };
}

const sampleData = [
  createData(1, "Samanta J.", "samanta@gmail.com", 1, "active"),
  createData(2, "Bob", "bob@gmail.com", 2, "disabled"),
  createData(3, "Kate", "kate@gmail.com", 3, "active"),
  createData(4, "Jack", "jack@gmail.com", 4, "disabled"),
  createData(5, "John D.", "john@gmail.com", 5, "active"),
  createData(6, "Emily R.", "emily@gmail.com", 1, "disabled"),
  createData(7, "Michael S.", "michael@gmail.com", 2, "active"),
  createData(8, "Sarah W.", "sarah@gmail.com", 3, "disabled"),
  createData(9, "David T.", "david@gmail.com", 4, "active"),
  createData(10, "Laura P.", "laura@gmail.com", 5, "disabled"),
  createData(11, "Chris K.", "chris@gmail.com", 1, "active"),
  createData(12, "Amanda L.", "amanda@gmail.com", 2, "disabled"),
  createData(13, "James B.", "james@gmail.com", 3, "active"),
  createData(14, "Lisa M.", "lisa@gmail.com", 4, "disabled"),
  createData(15, "Daniel F.", "daniel@gmail.com", 5, "active"),
];

const Schools = () => {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [rows, setRows] = useState(sampleData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const profileMenuRef = useRef(null);
  const modalRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/");
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOutsideClick = useCallback(
    (e) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setProfileMenuOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleCloseModal();
      }
      const updatedRows = rows.map((row) => {
        if (
          row.actionMenuRef.current &&
          !row.actionMenuRef.current.contains(e.target)
        ) {
          row.actionMenuOpen = false;
        }
        return row;
      });
      setRows(updatedRows);
    },
    [rows]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [rows, handleOutsideClick]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleActionClick = (id) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        row.actionMenuOpen = !row.actionMenuOpen;
      } else {
        row.actionMenuOpen = false;
      }
      return row;
    });
    setRows(updatedRows);
  };

  const filteredRows = rows.filter(
    (row) =>
      row.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
      row.email.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col">
      <header className="flex flex-wrap justify-between items-center p-4 bg-white shadow sticky top-0">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <h1 className="text-2xl font-bold">School Fitness Test</h1>
        </div>
        <div className="relative w-full md:w-1/3 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search"
            className="p-2 w-full border rounded-full pl-10 bg-gray-100"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <HiSearch className="absolute top-3 left-3 text-gray-500" />
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto mt-4 md:mt-0">
          <button
            className="flex items-center p-2 pl-4 pr-4 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
            onClick={handleOpenModal}
          >
            <IoMdAdd className="mr-3" />
            New Account
          </button>
          <div className="relative" ref={profileMenuRef}>
            <img
              src="/profile.png"
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer object-cover mx-auto"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            />
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-20">
                <div className="p-2">
                  <div className="flex flex-col items-start px-4 py-2 text-sm text-gray-700">
                    <span className="font-bold">Admin</span>
                    <span>admin@example.com</span>
                  </div>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-30">
          <div
            ref={modalRef}
            className="bg-white rounded-3xl p-8 shadow-lg relative w-full max-w-lg"
          >
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter name"
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email"
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div className="mb-6">
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-gray-600">
                  Create default licenses
                </span>
              </label>
            </div>
            <button className="w-full bg-green-500 text-white py-2 mt-4 rounded-2xl hover:bg-green-600">
              Create
            </button>
          </div>
        </div>
      )}
      <div className="p-4 flex-1 overflow-auto">
        <Paper sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 150px)" }}>
            <Table aria-label="sticky table">
              <TableHead style={{ backgroundColor: "#f7f7f7" }}>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.length > 0 ? (
                  filteredRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={row.id}
                        >
                          {columns.map((column) => {
                            const value =
                              column.id === "index"
                                ? page * rowsPerPage + index + 1
                                : row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format
                                  ? column.format(row, handleActionClick)
                                  : value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </div>
    </div>
  );
};

export default Schools;
