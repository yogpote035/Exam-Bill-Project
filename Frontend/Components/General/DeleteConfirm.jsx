import Swal from "sweetalert2";


const deleteConfirm = async (
  title = "Delete this item?",
  text = "Once deleted, you cannot recover this."
) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33", // Red confirm button
    cancelButtonColor: "#6c757d", // Gray cancel button
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
    
  });

  return result.isConfirmed;
};

export default deleteConfirm;