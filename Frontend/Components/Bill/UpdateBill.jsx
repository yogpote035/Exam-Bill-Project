import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  updateBill,
  fetchBillById,
} from "../../AllStateContainer/Bill/BillSlice";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { toWords } from "number-to-words";

export default function UpdateBill() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); // Get bill ID from URL params
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedType, setDraggedType] = useState(null);

  // Get bill data from Redux store
  const {
    singleBill: currentBill,
    loading,
    error,
  } = useSelector((state) => state.bill);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      department: "",
      programLevel: "",
      className: "",
      subject: "",
      semester: "",
      examSession: "",
      examType: "",
      paperNo: "",
      examStartTime: new Date(),
      examEndTime: new Date(),
      totalStudents: 0,
      presentStudents: 0,
      absentStudents: 0,
      totalBatches: 1,
      durationPerBatch: 1,
      balancePayable: 0,
      amountInWords: "",
      batches: [{ batchNo: "Batch 1", studentsPresent: 0 }],
      staffPayments: [
        {
          role: "External Examiner",
          persons: [
            {
              name: "",
              mobile: "",
              rate: "",
              extraAllowance: 0,
              totalAmount: 0,
              presentTime: { inTime: new Date(), outTime: new Date() },
            },
          ],
        },
      ],
    },
  });

  // Field arrays must be declared at the top level
  const {
    fields: batchFields,
    append: appendBatch,
    remove: removeBatch,
    move: moveBatch,
  } = useFieldArray({ control, name: "batches" });

  const {
    fields: staffFields,
    append: appendStaff,
    remove: removeStaff,
    move: moveStaff,
    update: updateStaff,
  } = useFieldArray({ control, name: "staffPayments" });

  // Watch fields for calculations
  const batchesWatch = useWatch({ control, name: "batches" });
  const staffWatch = useWatch({ control, name: "staffPayments" });

  // Fetch bill data when component mounts
  useEffect(() => {
    if (id) {
      dispatch(fetchBillById(id));
    }
  }, [dispatch, id]);

  // Populate form with bill data when it's loaded
  useEffect(() => {
    if (currentBill && id === currentBill._id) {
      // Format dates for the form
      const formattedBill = {
        ...currentBill,
        examStartTime: new Date(currentBill.examStartTime),
        examEndTime: new Date(currentBill.examEndTime),
        staffPayments: currentBill.staffPayments.map((staff) => ({
          ...staff,
          persons: staff.persons.map((person) => ({
            ...person,
            presentTime: {
              inTime: new Date(person.presentTime.inTime),
              outTime: new Date(person.presentTime.outTime),
            },
          })),
        })),
      };

      reset(formattedBill);
    }
  }, [currentBill, id, reset]);

  // Function to convert number to words
  const convertNumberToWords = (num) => {
    if (num === 0) return "Zero";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] +
        (num % 10 !== 0 ? " " + ones[num % 10] : "")
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 !== 0 ? " " + convertNumberToWords(num % 100) : "")
      );
    if (num < 100000)
      return (
        convertNumberToWords(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 !== 0 ? " " + convertNumberToWords(num % 1000) : "")
      );
    if (num < 10000000)
      return (
        convertNumberToWords(Math.floor(num / 100000)) +
        " Lakh" +
        (num % 100000 !== 0 ? " " + convertNumberToWords(num % 100000) : "")
      );
    return (
      convertNumberToWords(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 !== 0 ? " " + convertNumberToWords(num % 10000000) : "")
    );
  };

  // Auto-calculate total students and staff payments
  useEffect(() => {
    // Calculate total students from batches
    const totalStudents = batchesWatch?.reduce(
      (sum, batch) => sum + Number(batch.studentsPresent || 0),
      0
    );

    // Calculate absent students
    const presentStudents = totalStudents;
    const absentStudents = (getValues("totalStudents") || 0) - presentStudents;

    // Update student counts
    setValue("presentStudents", presentStudents);
    setValue("absentStudents", absentStudents > 0 ? absentStudents : 0);
    setValue("totalBatches", batchFields.length);

    // Auto-update each staff person's totalAmount
    let billTotal = 0;

    staffWatch?.forEach((staff, sIndex) => {
      staff.persons?.forEach((person, pIndex) => {
        const rate = Number(person.rate || 0);
        const extra = Number(person.extraAllowance || 0);
        const total = totalStudents * rate + extra;

        // Only update if value changed
        if (person.totalAmount !== total) {
          setValue(
            `staffPayments.${sIndex}.persons.${pIndex}.totalAmount`,
            total
          );
        }

        billTotal += total;
      });
    });

    // Only update totalAmount if changed
    setValue("totalAmount", billTotal);
  }, [batchesWatch, staffWatch, setValue, getValues, batchFields.length]);

  // Update amount in words when total amount changes
  useEffect(() => {
    const total = getValues("totalAmount") || 0;
    if (total > 0) {
      try {
        const words = convertNumberToWords(total);
        setValue("amountInWords", `${words} Only`);
      } catch (error) {
        console.error("Error converting amount to words:", error);
      }
    } else {
      setValue("amountInWords", "");
    }
  }, [getValues("totalAmount"), setValue]);

  const onSubmit = (data) => {
    const transformedData = {
      ...data,
      programLevel: data.programLevel,
      semester: Number(data.semester),
      totalStudents: Number(data.totalStudents),
      presentStudents: Number(data.presentStudents),
      absentStudents: Number(data.absentStudents),
      totalBatches: Number(data.totalBatches),
      durationPerBatch: Number(data.durationPerBatch),
      totalAmount: Number(data.totalAmount),
      balancePayable: Number(data.balancePayable),
      batches: data.batches.map((batch) => ({
        ...batch,
        studentsPresent: Number(batch.studentsPresent),
      })),
      staffPayments: data.staffPayments.map((staff) => ({
        ...staff,
        persons: staff.persons.map((person) => ({
          ...person,
          rate: Number(person.rate),
          extraAllowance: Number(person.extraAllowance),
          totalAmount: Number(person.totalAmount),
          presentTime: {
            inTime: new Date(person.presentTime.inTime),
            outTime: new Date(person.presentTime.outTime),
          },
        })),
      })),
      examStartTime: new Date(data.examStartTime),
      examEndTime: new Date(data.examEndTime),
    };

    dispatch(updateBill(id, transformedData, navigate));
  };

  // Drag and drop handlers
  const handleDragStart = (e, index, type) => {
    setDraggedItem(index);
    setDraggedType(type);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedItem(null);
    setDraggedType(null);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, dropIndex, dropType) => {
    e.preventDefault();
    if (draggedItem === null || draggedType !== dropType) return;

    if (dropType === "batch") moveBatch(draggedItem, dropIndex);
    else if (dropType === "staff") moveStaff(draggedItem, dropIndex);
  };

  // Helper function to add a person to a staff group
  const addPersonToStaff = (sIndex) => {
    const currentStaff = getValues(`staffPayments.${sIndex}`);
    const newPerson = {
      name: "",
      mobile: "",
      rate: "",
      extraAllowance: 0,
      totalAmount: 0,
      presentTime: { inTime: new Date(), outTime: new Date() },
    };

    // Update the staff object with the new person
    const updatedStaff = {
      ...currentStaff,
      persons: [...(currentStaff.persons || []), newPerson],
    };

    // Use the update method from useFieldArray to trigger re-rendering
    updateStaff(sIndex, updatedStaff);
  };

  // Helper function to remove a person from a staff group
  const removePersonFromStaff = (sIndex, pIndex) => {
    const currentStaff = getValues(`staffPayments.${sIndex}`);
    if (currentStaff.persons && currentStaff.persons.length > 1) {
      const updatedStaff = {
        ...currentStaff,
        persons: currentStaff.persons.filter((_, index) => index !== pIndex),
      };

      // Use the update method from useFieldArray to trigger re-rendering
      updateStaff(sIndex, updatedStaff);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-6 p-6 shadow-lg rounded-2xl bg-white">
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">Loading bill data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-6 p-6 shadow-lg rounded-2xl bg-white">
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-red-500">Error loading bill: {error}</p>
        </div>
      </div>
    );
  }

  console.log(currentBill);

  return (
    <div className="max-w-6xl mx-auto mt-6 p-6 shadow-lg rounded-2xl bg-white">
      <h2 className="text-2xl font-bold mb-6">Update Staff Payment Bill</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-6"
      >
        {/* Department */}
        <div>
          <label className="block mb-1 font-medium">Department</label>
          <select
            {...register("department", { required: "Department is required" })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Arts">Arts</option>
            <option value="Commerce">Commerce</option>
            <option value="Biotech">Biotech</option>
            <option value="Sociology">Sociology</option>
            <option value="Electronics">Electronics</option>
            <option value="Law">Law</option>
            <option value="BBA">BBA</option>
            <option value="BBA-CA">BBA-CA</option>
            <option value="BCA">BCA</option>
          </select>
          {errors.department && (
            <p className="text-red-500 text-sm">{errors.department.message}</p>
          )}
        </div>

        {/* Course Level */}
        <div>
          <label className="block mb-1 font-medium">Course Level</label>
          <select
            {...register("programLevel", {
              required: "Course Level is required",
            })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select UG / PG</option>
            <option value="UG">UG</option>
            <option value="PG">PG</option>
          </select>
          {errors.programLevel && (
            <p className="text-red-500 text-sm">
              {errors.programLevel.message}
            </p>
          )}
        </div>

        {/* Class */}
        <div>
          <label className="block mb-1 font-medium">Class</label>
          <input
            {...register("className", { required: "Class is required" })}
            placeholder="T.Y. B.Sc. (Comp Sci)"
            className="w-full border rounded px-3 py-2"
          />
          {errors.className && (
            <p className="text-red-500 text-sm">{errors.className.message}</p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block mb-1 font-medium">Subject</label>
          <input
            {...register("subject", { required: "Subject is required" })}
            placeholder="Operating Systems"
            className="w-full border rounded px-3 py-2"
          />
          {errors.subject && (
            <p className="text-red-500 text-sm">{errors.subject.message}</p>
          )}
        </div>

        {/* Semester */}
        <div>
          <label className="block mb-1 font-medium">Semester</label>
          <select
            {...register("semester", { required: "Semester is required" })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Semester</option>
            {[1, 2, 3, 4, 5, 6].map((sem) => (
              <option key={sem} value={sem}>{`Semester ${sem}`}</option>
            ))}
          </select>
          {errors.semester && (
            <p className="text-red-500 text-sm">{errors.semester.message}</p>
          )}
        </div>

        {/* Exam Session */}
        <div>
          <label className="block mb-1 font-medium">Exam Session</label>
          <input
            {...register("examSession", {
              required: "Exam session is required",
            })}
            placeholder="March/April 2025"
            className="w-full border rounded px-3 py-2"
          />
          {errors.examSession && (
            <p className="text-red-500 text-sm">{errors.examSession.message}</p>
          )}
        </div>

        {/* Exam Type */}
        <div>
          <label className="block mb-1 font-medium">Exam Type</label>
          <select
            {...register("examType", { required: "Exam type is required" })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Type</option>
            <option value="Theory">Theory</option>
            <option value="Internal">Internal</option>
            <option value="External">External</option>
            <option value="Practical">Practical</option>
            <option value="Department">Department</option>
            <option value="Other">Other</option>
          </select>
          {errors.examType && (
            <p className="text-red-500 text-sm">{errors.examType.message}</p>
          )}
        </div>

        {/* Paper No */}
        <div>
          <label className="block mb-1 font-medium">Paper No</label>
          <input
            {...register("paperNo")}
            placeholder="Paper II"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Total Students (Manual Input) */}
        <div>
          <label className="block mb-1 font-medium">
            Total Students <span className="text-gray-500">(Manual entry)</span>
          </label>
          <input
            type="number"
            {...register("totalStudents", {
              required: "Total students is required",
              min: { value: 0, message: "Must be a positive number" },
            })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.totalStudents && (
            <p className="text-red-500 text-sm">
              {errors.totalStudents.message}
            </p>
          )}
        </div>

        {/* Exam Start / End */}
        <Controller
          name="examStartTime"
          control={control}
          rules={{ required: "Exam start time is required" }}
          render={({ field }) => (
            <div>
              <label className="block mb-1 font-medium">Exam Start</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={
                    field.value
                      ? format(new Date(field.value), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) => {
                    const date = field.value
                      ? new Date(field.value)
                      : new Date();
                    const [y, m, d] = e.target.value.split("-").map(Number);
                    date.setFullYear(y, m - 1, d);
                    field.onChange(date);
                  }}
                  className="border rounded px-2 py-1"
                />
                <input
                  type="time"
                  value={
                    field.value
                      ? format(new Date(field.value), "HH:mm")
                      : "00:00"
                  }
                  onChange={(e) => {
                    const date = field.value
                      ? new Date(field.value)
                      : new Date();
                    const [h, m] = e.target.value.split(":").map(Number);
                    date.setHours(h, m);
                    field.onChange(date);
                  }}
                  className="border rounded px-2 py-1"
                />
              </div>
              {errors.examStartTime && (
                <p className="text-red-500 text-sm">
                  {errors.examStartTime.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="examEndTime"
          control={control}
          rules={{ required: "Exam end time is required" }}
          render={({ field }) => (
            <div>
              <label className="block mb-1 font-medium">Exam End</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={
                    field.value
                      ? format(new Date(field.value), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) => {
                    const date = field.value
                      ? new Date(field.value)
                      : new Date();
                    const [y, m, d] = e.target.value.split("-").map(Number);
                    date.setFullYear(y, m - 1, d);
                    field.onChange(date);
                  }}
                  className="border rounded px-2 py-1"
                />
                <input
                  type="time"
                  value={
                    field.value
                      ? format(new Date(field.value), "HH:mm")
                      : "00:00"
                  }
                  onChange={(e) => {
                    const date = field.value
                      ? new Date(field.value)
                      : new Date();
                    const [h, m] = e.target.value.split(":").map(Number);
                    date.setHours(h, m);
                    field.onChange(date);
                  }}
                  className="border rounded px-2 py-1"
                />
              </div>
              {errors.examEndTime && (
                <p className="text-red-500 text-sm">
                  {errors.examEndTime.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Duration Per Batch */}
        <div>
          <label className="block mb-1 font-medium">
            Duration Per Batch (hours)
          </label>
          <input
            type="number"
            {...register("durationPerBatch", {
              required: "Duration is required",
              min: { value: 0.5, message: "Must be at least 0.5 hours" },
            })}
            step="0.5"
            className="w-full border rounded px-3 py-2"
          />
          {errors.durationPerBatch && (
            <p className="text-red-500 text-sm">
              {errors.durationPerBatch.message}
            </p>
          )}
        </div>

        {/* Present Students (Auto-calculated) */}
        <div>
          <label className="block mb-1 font-medium">Present Students</label>
          <input
            type="number"
            {...register("presentStudents")}
            className="w-full border rounded px-3 py-2 bg-gray-100"
            readOnly
          />
        </div>

        {/* Absent Students (Auto-calculated) */}
        <div>
          <label className="block mb-1 font-medium">Absent Students</label>
          <input
            type="number"
            {...register("absentStudents")}
            className="w-full border rounded px-3 py-2 bg-gray-100"
            readOnly
          />
        </div>

        {/* Total Batches (Auto-calculated) */}
        <div>
          <label className="block mb-1 font-medium">Total Batches</label>
          <input
            type="number"
            {...register("totalBatches")}
            className="w-full border rounded px-3 py-2 bg-gray-100"
            readOnly
          />
        </div>

        {/* Batches Section */}
        <div className="col-span-2 mb-8">
          <h3 className="font-bold mb-4 text-lg">Batches</h3>
          <div className="min-h-[100px] p-2 rounded-lg border-2 border-dashed border-gray-300">
            {batchFields.map((batch, index) => (
              <div
                key={batch.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index, "batch")}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index, "batch")}
                className="p-4 mb-2 rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-move transition-colors relative"
              >
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block mb-1 font-medium text-sm">
                      Batch Name
                    </label>
                    <input
                      {...register(`batches.${index}.batchNo`, {
                        required: "Batch name is required",
                      })}
                      placeholder="Batch 1"
                      className="border rounded px-2 py-1 w-full"
                    />
                    {errors.batches?.[index]?.batchNo && (
                      <p className="text-red-500 text-sm">
                        {errors.batches[index].batchNo.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">
                      Students Present
                    </label>
                    <input
                      type="number"
                      {...register(`batches.${index}.studentsPresent`, {
                        required: "Students count is required",
                        min: { value: 0, message: "Must be a positive number" },
                      })}
                      placeholder="30"
                      className="border rounded px-2 py-1 w-full"
                    />
                    {errors.batches?.[index]?.studentsPresent && (
                      <p className="text-red-500 text-sm">
                        {errors.batches[index].studentsPresent.message}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeBatch(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              appendBatch({
                batchNo: `Batch ${batchFields.length + 1}`,
                studentsPresent: 0,
              })
            }
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Batch
          </button>
        </div>

        {/* Staff Payments Section */}
        <div className="col-span-2 mb-8">
          <h3 className="font-bold mb-4 text-lg">Staff Payments</h3>
          {staffFields.map((staff, sIndex) => (
            <div
              key={staff.id}
              draggable
              onDragStart={(e) => handleDragStart(e, sIndex, "staff")}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, sIndex, "staff")}
              className="relative p-4 mb-3 rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-move transition-colors"
            >
              <div className="absolute top-2 right-2 text-gray-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5h2v2H8zM14 5h2v2h-2zM8 11h2v2H8zM14 11h2v2h-2zM8 17h2v2H8zM14 17h2v2h-2z" />
                </svg>
              </div>

              {/* Role */}
              <div className="mb-3">
                <label className="block mb-1 font-medium">Role</label>
                <select
                  {...register(`staffPayments.${sIndex}.role`, {
                    required: "Role is required",
                  })}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="">Select Role</option>
                  <option value="Internal Examiner">Internal Examiner</option>
                  <option value="External Examiner">External Examiner</option>
                  <option value="Store Keeper">Store Keeper</option>
                  <option value="Peon">Peon</option>
                  <option value="Expert Assistant">Expert Assistant</option>
                  <option value="Lab Assistant">Lab Assistant</option>
                </select>
                {errors.staffPayments?.[sIndex]?.role && (
                  <p className="text-red-500 text-sm">
                    {errors.staffPayments[sIndex].role.message}
                  </p>
                )}
              </div>

              {/* Persons */}
              {staff.persons?.map((person, pIndex) => (
                <div
                  key={pIndex}
                  className="grid grid-cols-6 gap-2 items-center p-2 bg-white rounded border mb-2"
                >
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Name
                    </label>
                    <input
                      {...register(
                        `staffPayments.${sIndex}.persons.${pIndex}.name`,
                        { required: "Name is required" }
                      )}
                      placeholder="Name"
                      className="border rounded px-2 py-1 w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Mobile
                    </label>
                    <input
                      {...register(
                        `staffPayments.${sIndex}.persons.${pIndex}.mobile`
                      )}
                      placeholder="Mobile"
                      className="border rounded px-2 py-1 w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Rate
                    </label>
                    <input
                      type="number"
                      {...register(
                        `staffPayments.${sIndex}.persons.${pIndex}.rate`,
                        {
                          required: "Rate is required",
                          min: {
                            value: 0,
                            message: "Must be a positive number",
                          },
                        }
                      )}
                      placeholder="Rate"
                      className="border rounded px-2 py-1 w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Extra
                    </label>
                    <input
                      type="number"
                      {...register(
                        `staffPayments.${sIndex}.persons.${pIndex}.extraAllowance`
                      )}
                      placeholder="Extra"
                      className="border rounded px-2 py-1 w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Total
                    </label>
                    <input
                      {...register(
                        `staffPayments.${sIndex}.persons.${pIndex}.totalAmount`
                      )}
                      readOnly
                      className="border rounded px-2 py-1 w-full text-sm bg-gray-100"
                    />
                  </div>
                  <div className="flex justify-center items-end h-full">
                    <button
                      type="button"
                      onClick={() => removePersonFromStaff(sIndex, pIndex)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      disabled={staff.persons.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => addPersonToStaff(sIndex)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Add Person
                </button>

                <button
                  type="button"
                  onClick={() => removeStaff(sIndex)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Remove Role
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              appendStaff({
                role: "",
                persons: [
                  {
                    name: "",
                    mobile: "",
                    rate: "",
                    extraAllowance: 0,
                    totalAmount: 0,
                    presentTime: { inTime: new Date(), outTime: new Date() },
                  },
                ],
              })
            }
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Staff Role
          </button>
        </div>

        {/* Totals */}
        <div>
          <label className="block mb-1 font-medium">Total Amount</label>
          <input
            {...register("totalAmount")}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100 font-semibold"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Balance Payable</label>
          <input
            type="number"
            {...register("balancePayable", {
              required: "Balance payable is required",
              min: { value: 0, message: "Must be a positive number" },
            })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.balancePayable && (
            <p className="text-red-500 text-sm">
              {errors.balancePayable.message}
            </p>
          )}
        </div>
        <div className="col-span-2">
          <label className="block mb-1 font-medium">Amount in Words</label>
          <input
            {...register("amountInWords", {
              required: "Amount in words is required",
            })}
            readOnly
            placeholder="Five Thousand Only"
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
          {errors.amountInWords && (
            <p className="text-red-500 text-sm">
              {errors.amountInWords.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="col-span-2 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/bills")}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Bill"}
          </button>
        </div>
      </form>
    </div>
  );
}
