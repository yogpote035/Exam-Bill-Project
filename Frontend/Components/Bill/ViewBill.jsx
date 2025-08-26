import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadBill,
  fetchBillById,
} from "../../AllStateContainer/Bill/BillSlice";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Printer } from "lucide-react";

export default function ViewBill() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    singleBill: currentBill,
    loading,
    error,
  } = useSelector((state) => state.bill);

  useEffect(() => {
    if (id) {
      dispatch(fetchBillById(id));
    }
  }, [dispatch, id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!currentBill) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        Bill not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/bills")}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Bills
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/edit-bill/${id}`)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          >
            <Edit className="h-5 w-5 mr-2" />
            Edit Bill
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Bill
          </button>
          <button
            onClick={() => dispatch(downloadBill(currentBill._id))}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <Printer className="h-5 w-5 mr-2" />
            Download Bill
          </button>
        </div>
      </div>

      {/* Bill Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        {/* Bill Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">
            MODERN COLLEGE, GANESHKIND, PUNE-411016
          </h2>
          <p className="text-lg">
            {currentBill.examSession} Practical Examination
          </p>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p>
              <strong>Department:</strong> {currentBill.department}
            </p>
            <p>
              <strong>Class:</strong> {currentBill.className}
            </p>
            <p>
              <strong>Subject:</strong> {currentBill.subject}
            </p>
          </div>
          <div>
            <p>
              <strong>Semester:</strong> {currentBill.semester}
            </p>
            <p>
              <strong>Exam Type:</strong> {currentBill.examType}
            </p>
            <p>
              <strong>Paper No:</strong> {currentBill.paperNo || "N/A"}
            </p>
          </div>
        </div>

        {/* Student Information */}
        <div className="mb-6">
          <h3 className="font-bold mb-2 text-lg border-b pb-2">
            Student Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <p>
              <strong>Total Students:</strong> {currentBill.totalStudents}
            </p>
            <p>
              <strong>Present Students:</strong> {currentBill.presentStudents}
            </p>
            <p>
              <strong>Absent Students:</strong> {currentBill.absentStudents}
            </p>
            <p>
              <strong>Total Batches:</strong> {currentBill.totalBatches}
            </p>
            <p>
              <strong>Duration per Batch:</strong>{" "}
              {currentBill.durationPerBatch} hrs
            </p>
          </div>
        </div>

        {/* Batches Table */}
        {currentBill.batches && currentBill.batches.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2 text-lg border-b pb-2">
              Batch Details
            </h3>
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2">Batch No</th>
                  <th className="border border-gray-300 px-3 py-2">
                    Students Present
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentBill.batches.map((batch, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {batch.batchNo}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {batch.studentsPresent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Staff Payments */}
        {currentBill.staffPayments && currentBill.staffPayments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2 text-lg border-b pb-2">
              Staff Appointed and Remuneration
            </h3>
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2">Sr. No.</th>
                  <th className="border border-gray-300 px-3 py-2">Role</th>
                  <th className="border border-gray-300 px-3 py-2">Name</th>
                  <th className="border border-gray-300 px-3 py-2">
                    Rate + Extra
                  </th>
                  <th className="border border-gray-300 px-3 py-2">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentBill.staffPayments.flatMap((staff, sIndex) =>
                  staff.persons.map((person, pIndex) => (
                    <tr key={`${sIndex}-${pIndex}`}>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {sIndex + 1}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {staff.role}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {person.name}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {currentBill.presentStudents} (Present Students)
                        <span className="text-rose-500"> X</span> ₹{person.rate}
                        (Rate Per Student){" "}
                        <span className="text-rose-500"> + </span>{" "}
                        {person.extraAllowance}(Extra Allowance )
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        ₹{person.totalAmount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-lg">
              <strong>Total Amount:</strong> ₹
              {currentBill.totalAmount?.toLocaleString("en-IN")}
            </p>
            <p className="text-lg">
              <strong>Balance Payable:</strong> ₹
              {currentBill.balancePayable?.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-lg">
              <strong>Amount in Words:</strong> {currentBill.amountInWords}
            </p>
          </div>
        </div>

        {/* Exam Timings */}
        <div className="mb-6">
          <h3 className="font-bold mb-2 text-lg border-b pb-2">Exam Timings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Start:</strong>{" "}
              {currentBill.examStartTime &&
                format(
                  new Date(currentBill.examStartTime),
                  "dd MMM yyyy, hh:mm a"
                )}
            </p>
            <p>
              <strong>End:</strong>{" "}
              {currentBill.examEndTime &&
                format(
                  new Date(currentBill.examEndTime),
                  "dd MMM yyyy, hh:mm a"
                )}
            </p>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 mt-12">
              <p>In Charge</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 mt-12">
              <p>Vice Principal</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 mt-12">
              <p>Principal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
