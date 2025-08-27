import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadBankDetailForm,
  downloadBill,
  downloadPersonBill,
  fetchBillById,
  mailMainBillToOther,
  mailMainBillToSelf,
  mailPersonalBillsToOther,
  mailPersonalBillsToSelf,
} from "../../AllStateContainer/Bill/BillSlice";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Edit, Mail, Printer, User } from "lucide-react";
import { BiLogoGmail } from "react-icons/bi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function ViewBill() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const [selectedPerson, setSelectedPerson] = useState(null);

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

  // const handlePrint = () => {
  //   window.print();
  // };

  const handleViewPersonBill = (staffRole, person) => {
    setSelectedPerson({
      ...person,
      role: staffRole,
      presentStudents: currentBill.presentStudents,
      examSession: currentBill.examSession,
      examType: currentBill.examType,
      department: currentBill.department,
      className: currentBill.className,
      subject: currentBill.subject,
      semester: currentBill.semester,
      examStartTime: currentBill.examStartTime,
      examEndTime: currentBill.examEndTime,
    });
  };

  const handleClosePersonBill = () => {
    setSelectedPerson(null);
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

  const handlePersonalMailBill = async () => {
    const { value: option } = await MySwal.fire({
      title: "Mail Bill",
      text: "Do you want to mail this bill to yourself or another email?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Self",
      cancelButtonText: "Other",
      reverseButtons: true,
    });

    if (option) {
      dispatch(mailPersonalBillsToSelf(currentBill._id));
    } else {
      // User clicked "Other"
      const { value: email } = await MySwal.fire({
        title: "Enter Email Address",
        input: "email",
        inputPlaceholder: "example@gmail.com",
        showCancelButton: true,
      });

      if (email) {
        dispatch(mailPersonalBillsToOther(currentBill._id, email));
      }
    }
  };
  const handleMainMailBill = async () => {
    const { value: option } = await MySwal.fire({
      title: "Mail Bill",
      text: "Do you want to mail this bill to yourself or another email?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Self",
      cancelButtonText: "Other",
      reverseButtons: true,
    });

    if (option) {
      dispatch(mailMainBillToSelf(currentBill._id));
    } else {
      // User clicked "Other"
      const { value: email } = await MySwal.fire({
        title: "Enter Email Address",
        input: "email",
        inputPlaceholder: "example@gmail.com",
        showCancelButton: true,
      });

      if (email) {
        dispatch(mailMainBillToOther(currentBill._id, email));
      }
    }
  };
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Bills
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/edit-bill/${id}`)}
            className="bg-gradient-to-r from-green-500  to-green-600 hover:from-green-600 hover:to-green-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Edit className="h-5 w-5 mr-2" />
            Edit Bill
          </button>
          {/* <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Bill
          </button> */}
          <button
            onClick={handlePersonalMailBill}
            className="bg-gradient-to-r from-orange-400  to-orange-600 hover:from-orange-600 hover:to-orange-400 text-white px-4 py-2 rounded flex items-center"
          >
            <BiLogoGmail className="h-5 w-5 mr-2 text-white hover:text-gray-600" />
            Mail Personal Bills
          </button>
          <button
            onClick={handleMainMailBill}
            className="bg-gradient-to-r from-amber-500  to-orange-600 hover:from-orange-600 hover:to-amber-500 text-white px-4 py-2 rounded flex items-center"
          >
            <BiLogoGmail className="h-5 w-5 mr-2 text-white hover:text-black" />
            Mail Bill
          </button>
          <button
            onClick={() => dispatch(downloadBill(currentBill._id))}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-indigo-600 hover:to-green-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Bill(Main)
          </button>{" "}
          <button
            onClick={() => dispatch(downloadPersonBill(currentBill._id))}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-green-600 hover:to-blue-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Bill(Personal Bills)
          </button>{" "} 
          <button
            onClick={() => dispatch(downloadBankDetailForm())}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-green-600 hover:to-blue-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Bank Detail Form
          </button>{" "}
        </div>
      </div>

      {/* Bill Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        {/* Bill Header with Logo */}
        <div className="text-center mb-6 border-b-4 border-blue-600 pb-6">
          <div className="mb-4 text-lg font-semibold text-blue-800">
            Progressive Education Society
          </div>

          <div className="mb-4">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiDX-TI_GWDRoSUoutAJU6HDoAwjH9sPY_PUd2yOYyYNdY6g6un5KNinkcCQmHdmuqIPg&usqp=CAU"
              alt="College Logo"
              className="h-20 w-20 object-contain mx-auto"
            />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 leading-tight">
              MODERN COLLEGE OF ARTS, SCIENCE, AND COMMERCE
            </h2>
            <h3 className="text-xl font-semibold text-gray-600 mt-1">
              (AUTONOMOUS)
            </h3>
            <p className="text-lg text-gray-500 mt-1">
              GANESHKHIND, PUNE - 411016
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg inline-block mt-4">
            <p className="text-xl font-semibold">
              {currentBill.examSession} {currentBill.examType} Examination
            </p>
          </div>
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
                  <th className="border border-gray-300 px-3 py-2">Action</th>
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
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <button
                          onClick={() =>
                            handleViewPersonBill(staff.role, person)
                          }
                          className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
                        >
                          <User className="h-4 w-4 mr-1" />
                          View Bill
                        </button>
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
              <p className="font-semibold">In Charge</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 mt-12">
              <p className="font-semibold">Vice Principal</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 mt-12">
              <p className="font-semibold">Principal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Single Person Bill Section */}
      {selectedPerson && (
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Bill for {selectedPerson.name}
            </h2>

            <button
              onClick={handleClosePersonBill}
              className="text-red-600 hover:text-red-800"
            >
              Close
            </button>
          </div>

          {/* Person Bill Header with College Logo and Name */}
          <div className="text-center mb-6 border-b-4 border-blue-600 pb-6">
            <div className="mb-4 text-lg font-semibold text-blue-800">
              Progressive Education Society
            </div>

            <div className="mb-4">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiDX-TI_GWDRoSUoutAJU6HDoAwjH9sPY_PUd2yOYyYNdY6g6un5KNinkcCQmHdmuqIPg&usqp=CAU"
                alt="College Logo"
                className="h-20 w-20 object-contain mx-auto"
              />
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                MODERN COLLEGE OF ARTS, SCIENCE, AND COMMERCE
              </h2>
              <h3 className="text-xl font-semibold text-gray-600 mt-1">
                (AUTONOMOUS)
              </h3>
              <p className="text-lg text-gray-500 mt-1">
                GANESHKHIND, PUNE - 411016
              </p>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Statement of Examination Remuneration
            </h2>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg inline-block mt-1">
              <p className="text-xl font-semibold">
                {selectedPerson.examSession} {selectedPerson.examType}{" "}
                Examination
              </p>
            </div>
          </div>

          {/* Person Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p>
                <strong>Name:</strong> {selectedPerson.name}
              </p>
              <p>
                <strong>Role:</strong> {selectedPerson.role}
              </p>
              <p>
                <strong>Department:</strong> {selectedPerson.department}
              </p>
            </div>
            <div>
              <p>
                <strong>Class:</strong> {selectedPerson.className}
              </p>
              <p>
                <strong>Subject:</strong> {selectedPerson.subject}
              </p>
              <p>
                <strong>Semester:</strong> {selectedPerson.semester}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h3 className="font-bold mb-2 text-lg border-b pb-2">
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p>
                <strong>Present Students:</strong>{" "}
                {selectedPerson.presentStudents}
              </p>
              <p>
                <strong>Rate per Student:</strong> ₹{selectedPerson.rate}
              </p>
              <p>
                <strong>Extra Allowance:</strong> ₹
                {selectedPerson.extraAllowance}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{selectedPerson.totalAmount}
              </p>
            </div>
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p className="text-lg">
                <strong>Calculation:</strong> {selectedPerson.presentStudents}{" "}
                students × ₹{selectedPerson.rate} + ₹
                {selectedPerson.extraAllowance} = ₹{selectedPerson.totalAmount}
              </p>
            </div>
          </div>

          {/* Exam Timings */}
          <div className="mb-6">
            <h3 className="font-bold mb-2 text-lg border-b pb-2">
              Exam Timings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p>
                <strong>Start:</strong>{" "}
                {selectedPerson.examStartTime &&
                  format(
                    new Date(selectedPerson.examStartTime),
                    "dd MMM yyyy, hh:mm a"
                  )}
              </p>
              <p>
                <strong>End:</strong>{" "}
                {selectedPerson.examEndTime &&
                  format(
                    new Date(selectedPerson.examEndTime),
                    "dd MMM yyyy, hh:mm a"
                  )}
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mt-12">
                <p className="font-semibold">In Charge</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mt-12">
                <p className="font-semibold">Vice Principal</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mt-12">
                <p className="font-semibold">Principal</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
