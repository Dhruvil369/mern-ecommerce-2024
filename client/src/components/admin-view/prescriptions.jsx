import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";

// Initialize socket
const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("token"),
  },
});

function AdminPrescriptionsView() {
  const [unassignedPrescriptions, setUnassignedPrescriptions] = useState([]);
  const [acceptedPrescriptions, setAcceptedPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);

  // Fetch prescriptions initially
  useEffect(() => {
    fetchUnassignedPrescriptions();
    fetchAcceptedPrescriptions();
  }, [user]);

  // Socket listeners
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Admin prescription socket connected");
    });

    const handleNewPrescription = (data) => {
      console.log("📋 New prescription received:", data);
      toast.success(
        <div className="flex items-center space-x-2">
          <span>📋 New prescription received!</span>
        </div>,
        {
          duration: 4000,
          style: {
            background: "#2563eb",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "12px",
          },
          icon: "🔔",
        }
      );
      fetchUnassignedPrescriptions();
    };

    socket.on("admin_new_prescription", handleNewPrescription);
    socket.on("prescription_accepted", () => {
      fetchUnassignedPrescriptions();
      fetchAcceptedPrescriptions();
    });

    return () => {
      socket.off("admin_new_prescription", handleNewPrescription);
      socket.off("prescription_accepted");
    };
  }, []);

  const fetchUnassignedPrescriptions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/prescriptions/unassigned");
      if (response.data.success) {
        setUnassignedPrescriptions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching unassigned prescriptions:", error);
      toast.error("Failed to load unassigned prescriptions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAcceptedPrescriptions = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/admin/prescriptions/assigned/${user.id}`);
      if (response.data.success) {
        setAcceptedPrescriptions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching accepted prescriptions:", error);
      toast.error("Failed to load accepted prescriptions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id) => {
    if (!user?.id) {
      toast.error("User information not available");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/admin/prescriptions/accept/${id}`, {
        adminId: user.id
      });

      if (response.data.success) {
        socket.emit("prescription_accepted", id);
        toast.success("✅ Prescription accepted successfully!");
        fetchUnassignedPrescriptions();
        fetchAcceptedPrescriptions();
      } else {
        toast.error("❌ Failed to accept prescription.");
      }
    } catch (error) {
      console.error("Error accepting prescription:", error);
      toast.error("❌ Failed to accept prescription.");
    }
  };

  const handleComplete = async (id) => {
    if (!user?.id) {
      toast.error("User information not available");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/admin/prescriptions/complete/${id}`, {
        adminId: user.id
      });

      if (response.data.success) {
        toast.success("✅ Prescription marked as completed!");
        fetchAcceptedPrescriptions();
      } else {
        toast.error("❌ Failed to complete prescription.");
      }
    } catch (error) {
      console.error("Error completing prescription:", error);
      toast.error("❌ Failed to complete prescription.");
    }
  };

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setOpenDetailsDialog(true);
  };

  const closeDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedPrescription(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Unassigned Prescriptions */}
      <Card className="overflow-hidden">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">🟡 Unassigned Prescriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="responsive-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Date</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">User</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Address</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedPrescriptions.length > 0 ? (
                  [...unassignedPrescriptions].map((prescription) => (
                    <TableRow key={prescription._id}>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                        {formatDate(prescription.uploadedAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                        {prescription.userName || "Anonymous"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                        {prescription.addressInfo ? (
                          <span className="text-xs">
                            {prescription.addressInfo.city}, {prescription.addressInfo.pincode}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No address</span>
                        )}
                      </TableCell>
                      <TableCell className="admin-orders-actions">
                        <Button
                          onClick={() => handleViewDetails(prescription)}
                          size="sm"
                          className="admin-orders-button"
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => handleAccept(prescription._id)}
                          size="sm"
                          className="bg-green-600 text-white admin-orders-button"
                        >
                          Accept
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      {isLoading ? "Loading..." : "No unassigned prescriptions."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Accepted Prescriptions */}
      <Card className="overflow-hidden">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">🟢 Accepted Prescriptions (You)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="responsive-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Date</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">User</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Address</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acceptedPrescriptions.length > 0 ? (
                  [...acceptedPrescriptions].map((prescription) => (
                    <TableRow key={prescription._id}>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                        {formatDate(prescription.uploadedAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                        {prescription.userName || "Anonymous"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                        {prescription.addressInfo ? (
                          <span className="text-xs">
                            {prescription.addressInfo.city}, {prescription.addressInfo.pincode}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No address</span>
                        )}
                      </TableCell>
                      <TableCell className="admin-orders-actions items-start xs:items-center">
                        <span className="text-xs sm:text-sm">{prescription.status}</span>
                        <Button
                          onClick={() => handleViewDetails(prescription)}
                          size="sm"
                          className="admin-orders-button"
                        >
                          View
                        </Button>
                        {prescription.status !== "completed" && (
                          <Button
                            onClick={() => handleComplete(prescription._id)}
                            size="sm"
                            className="bg-green-600 text-white admin-orders-button"
                          >
                            Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      {isLoading ? "Loading..." : "No accepted prescriptions."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Details Dialog */}
      <Dialog open={openDetailsDialog} onOpenChange={closeDialog}>
        <DialogContent
          className="max-w-[95vw] xs:max-w-[90vw] sm:max-w-[80vw] md:max-w-3xl w-full p-0 overflow-hidden"
          style={{ maxHeight: "90vh" }}
        >
          <div className="overflow-y-auto max-h-[80vh] p-4">
            {selectedPrescription && (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">Prescription Details</h2>
                <div className="mb-4">
                  <p><strong>Uploaded by:</strong> {selectedPrescription.userName || "Anonymous"}</p>
                  <p><strong>Date:</strong> {formatDate(selectedPrescription.uploadedAt)}</p>
                  <p><strong>Status:</strong> {selectedPrescription.status}</p>

                  {selectedPrescription.addressInfo && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <h3 className="font-semibold mb-2">Delivery Address:</h3>
                      <p>{selectedPrescription.addressInfo.address}</p>
                      <p>{selectedPrescription.addressInfo.city}, {selectedPrescription.addressInfo.pincode}</p>
                      <p>Phone: {selectedPrescription.addressInfo.phone}</p>
                      {selectedPrescription.addressInfo.notes && (
                        <p>Notes: {selectedPrescription.addressInfo.notes}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="w-full max-w-lg">
                  <img
                    src={`http://localhost:5000${selectedPrescription.imageUrl}`}
                    alt="Prescription"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  {selectedPrescription.status === "pending" && (
                    <Button
                      onClick={() => {
                        handleAccept(selectedPrescription._id);
                        closeDialog();
                      }}
                      className="bg-green-600 text-white"
                    >
                      Accept
                    </Button>
                  )}
                  {selectedPrescription.status === "assigned" && selectedPrescription.assignedTo === user?.id && (
                    <Button
                      onClick={() => {
                        handleComplete(selectedPrescription._id);
                        closeDialog();
                      }}
                      className="bg-green-600 text-white"
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminPrescriptionsView;
