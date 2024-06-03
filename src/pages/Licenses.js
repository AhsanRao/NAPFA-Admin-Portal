import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { FaSignOutAlt, FaRedo, FaTrashAlt, FaHome } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import API_BASE_URL from "../apiConfig";

function createData(index, licenseNo, status, expiryDate, deviceName) {
  return {
    index,
    licenseNo,
    status,
    expiryDate,
    deviceName,
    actionMenuOpen: false,
    actionMenuRef: React.createRef(),
  };
}

const Licenses = () => {
  const navigate = useNavigate();
  const { schoolId } = useParams();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const profileMenuRef = useRef(null);
  const modalRef = useRef(null);

  const [schoolName, setSchoolName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");

  const [numLicenses, setNumLicenses] = useState(1);

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/schools/${schoolId}`);
        setSchoolName(response.data.schoolName);
        setSchoolEmail(response.data.email);
      } catch (error) {
        console.error("Error fetching school details", error);
      }
    };

    fetchSchoolDetails();
  }, [schoolId]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/schools/${schoolId}/licenses`
      );
      const data = response.data.map((license, index) =>
        createData(
          index + 1,
          license.id,
          license.status,
          new Date(license.expiryDate).toLocaleDateString(),
          license.deviceName || "N/A"
        )
      );
      setRows(data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRedo = async (id) => {
    if (window.confirm("Are you sure you want to renew this license?")) {
      try {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        await axios.put(`${API_BASE_URL}/schools/${schoolId}/licenses/${id}`, {
          expiryDate: expiryDate.toISOString(),
        });
        setSnackbarMessage("License renewed successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchData();
      } catch (error) {
        console.error("Error renewing license", error);
        setSnackbarMessage("Failed to renew license");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this license?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/schools/${schoolId}/licenses/${id}`
        );
        setRows(rows.filter((row) => row.licenseNo !== id));
        setSnackbarMessage("License deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchData();
      } catch (error) {
        console.error("Error deleting license", error);
        setSnackbarMessage("Failed to delete license");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  const columns = [
    { id: "index", label: "No.", minWidth: 50 },
    { id: "licenseNo", label: "License No.", minWidth: 170 },
    {
      id: "status",
      label: "Status",
      minWidth: 100,
      align: "center",
      format: (row) => (
        <span
          className={`inline-block px-2 py-1 rounded-full w-20 text-center ${
            row.status === "expired"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { id: "expiryDate", label: "Expiry Date", minWidth: 100 },
    { id: "deviceName", label: "Device Name", minWidth: 170 },
    {
      id: "actions",
      label: "Actions",
      minWidth: 100,
      align: "left",
      format: (row, navigate) => (
        <div className="flex space-x-4">
          <button
            onClick={() => handleRedo(row.licenseNo)}
            className="text-blue-500 hover:text-blue-700"
            title="Renew License"
          >
            <FaRedo size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.licenseNo)}
            className="text-red-500 hover:text-red-700"
            title="Delete License"
          >
            <FaTrashAlt size={16} />
          </button>
        </div>
      ),
    },
  ];

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

  const handleAddLicenses = async () => {
    try {
      await axios.post(`${API_BASE_URL}/schools/${schoolId}/licenses/admin`, {
        numLicenses,
      });
      setSnackbarMessage("Licenses added successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error adding licenses", error);
      setSnackbarMessage("Failed to add licenses");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="flex flex-wrap justify-between items-center p-4 bg-white shadow sticky top-0">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <h1 className="text-2xl font-bold">Licenses Details</h1>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-1/3 mt-4 md:mt-0">
          <input
            type="text"
            value={schoolName}
            readOnly
            className="p-2 pl-4 w-full border rounded-md bg-gray-100 text-sm"
          />
          <input
            type="text"
            value={schoolEmail}
            readOnly
            className="p-2 pl-4 w-full border rounded-md bg-gray-100 text-sm"
          />
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto mt-4 md:mt-0">
          <button
            className="flex items-center p-2 pl-4 pr-4 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
            onClick={handleOpenModal}
          >
            <IoMdAdd className="mr-3" />
            Add More
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
                Number of Licenses
              </label>
              <input
                type="number"
                value={numLicenses}
                onChange={(e) => setNumLicenses(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                min="1"
              />
            </div>
            <button
              onClick={handleAddLicenses}
              className="w-full bg-green-500 text-white py-2 mt-4 rounded-2xl hover:bg-green-600"
            >
              Add Licenses
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
                  {rows.length > 0 ? (
                    rows
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row, index) => (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={row.licenseNo}
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
                      ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        align="center"
                        style={{ padding: "20px 0" }}
                      >
                        No Licenses!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="center"
            count={rows.length}
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

export default Licenses;
