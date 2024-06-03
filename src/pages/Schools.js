import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import TableRow from "@mui/material/TableRow";
import { FaSignOutAlt, FaEdit, FaHome, FaTrashAlt } from "react-icons/fa";
import { HiSearch } from "react-icons/hi";
import { IoMdAdd } from "react-icons/io";
import API_BASE_URL from "../apiConfig";

function createData(id, schoolId, name, email, licenses, allLicensesActive) {
  return {
    id,
    schoolId,
    name,
    email,
    licenses,
    allLicensesActive,
    actionMenuOpen: false,
    actionMenuRef: React.createRef(),
  };
}

const Schools = () => {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolEmail, setNewSchoolEmail] = useState("");
  const [createDefaultLicenses, setCreateDefaultLicenses] = useState(false);

  const profileMenuRef = useRef(null);
  const modalRef = useRef(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const columns = [
    { id: "index", label: "No.", minWidth: 50 },
    { id: "name", label: "Name", minWidth: 170 },
    { id: "email", label: "Email", minWidth: 170 },
    {
      id: "licenses",
      label: "No. of Licenses",
      minWidth: 100,
      align: "center",
    },
    {
      id: "allLicensesActive",
      label: "",
      minWidth: 50,
      align: "center",
      format: (row) => (
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            row.allLicensesActive ? "bg-green-500" : "bg-red-500"
          }`}
        ></span>
      ),
    },
    {
      id: "action",
      label: "Action",
      minWidth: 50,
      align: "left",
      format: (row, navigate) => (
        <div className="flex space-x-4">
          <FaEdit
            size={16}
            className="cursor-pointer text-blue-500"
            onClick={() => navigate(`/licenses/${row.schoolId}`)}
          />
          <FaTrashAlt
            size={16}
            className="cursor-pointer text-red-500"
            onClick={() => handleDelete(row.schoolId)}
          />
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/schools/admin`);
      const data = response.data.map((school, index) =>
        createData(
          index + 1,
          school.id,
          school.name,
          school.email,
          school.licenses,
          school.allLicensesActive
        )
      );
      setRows(data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleDelete = async (schoolId) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      try {
        await axios.delete(`${API_BASE_URL}/schools/${schoolId}`);
        setSnackbarMessage("School deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchData(); // Refresh the data
      } catch (error) {
        console.error("Error deleting school", error);
        if (error.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
          setSnackbarMessage(
            `Failed to delete school: ${error.response.data.message}`
          );
        } else if (error.request) {
          // The request was made but no response was received
          console.error("Request data:", error.request);
          setSnackbarMessage(
            "Failed to delete school: No response received from the server"
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error message:", error.message);
          setSnackbarMessage(`Failed to delete school: ${error.message}`);
        }
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleCreateNewSchool = async () => {
    try {
      await axios.post(`${API_BASE_URL}/schools/admin`, {
        schoolName: newSchoolName,
        email: newSchoolEmail,
        createDefaultLicenses,
      });
      setSnackbarMessage("School created successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchData(); // Refresh the data
      handleCloseModal();
    } catch (error) {
      console.error("Error creating new school", error);
      setSnackbarMessage("Failed to create school");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
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
                    onClick={() => navigate("/schools")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FaHome className="mr-2" />
                    Home
                  </button>
                  <hr className="my-1" />

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
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
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
                value={newSchoolEmail}
                onChange={(e) => setNewSchoolEmail(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={createDefaultLicenses}
                  onChange={(e) => setCreateDefaultLicenses(e.target.checked)}
                />
                <span className="ml-2 text-gray-600">
                  Create default licenses
                </span>
              </label>
            </div>
            <button
              className="w-full bg-green-500 text-white py-2 mt-4 rounded-2xl hover:bg-green-600"
              onClick={handleCreateNewSchool}
            >
              Create
            </button>
          </div>
        </div>
      )}
      <div className="p-4 flex-1 overflow-auto">
        <Paper sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
          <TableContainer
            sx={{ maxHeight: "calc(100vh - 150px)", minHeight: "20%" }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading...</p>
              </div>
            ) : (
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
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
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
                                    ? column.format(row, navigate)
                                    : value}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        align="center"
                        style={{ padding: "20px 0" }}
                      >
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default Schools;
