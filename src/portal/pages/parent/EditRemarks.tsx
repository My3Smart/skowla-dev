import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/portal/layouts/AppLayout";
import { api } from "@/portal/api";

interface AttendanceDetail {
  date?: string | null;
  checkin?: string | null;
  checkout?: string | null;
  name?: string | null;
  school?: string | null;
  status?: string | null;
  remarks?: string | null;
  remarksInput?: string | null;
}

export default function EditRemarks() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();
  const [data, setData] = useState<AttendanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [remarksInput, setRemarksInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
  if (!id) {
    console.error("Attendance ID is missing");
    setData(null);
    setLoading(false);
    return;
  }

  setLoading(true);

  api<AttendanceDetail | { data: AttendanceDetail }>(
    `/api/portal/remarks/${id}`
  )
    .then((res) => {
      console.log("FULL API RESPONSE:", JSON.stringify(res, null, 2));

      const attendance =
        res && "data" in res ? res.data : res;

      console.log("ATTENDANCE DETAILS:", JSON.stringify(attendance, null, 2));

      setData(attendance);
      setRemarks(attendance.remarks?.toLowerCase() ?? "");
      setRemarksInput(attendance.remarksInput ?? "");
    })
    .catch((error) => {
      console.error("FAILED TO LOAD ATTENDANCE:", error);
      setData(null);
    })
    .finally(() => setLoading(false));
}, [id]);

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  setSaving(true);
  setSuccessMessage("");
  setErrorMessage("");

  try {
    await api(`/api/portal/remarks/${id}`, {
      method: "POST",
      body: { remarks, remarksInput },
    });

    setSuccessMessage("Remarks saved successfully!");

    setTimeout(() => {
      navigate(-1);
    }, 1500);

  } catch (error) {
    console.error("Failed to save remarks:", error);
    setErrorMessage("Failed to save remarks. Please try again.");
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <AppLayout title="Edit Remarks" role="parent">
        <div className="card">
          <div className="card-body text-center text-muted py-10">Loading…</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Remarks" role="parent">
      <div className="card mb-5 mb-xl-10">
        <div className="card-header border-0">
          <div className="card-title m-0">
            <h3 className="fw-bold m-0">Edit Remarks</h3>
          </div>  
        </div>

        <div id="kt_account_settings_profile_details">
          <form id="kt_account_profile_details_form" className="form" onSubmit={handleSubmit}>
            <div className="card-body border-top p-9">
              <div className="row mb-6">
                <label className="col-lg-4 col-form-label fw-semibold fs-6">Date</label>
                <div className="col-lg-8 fv-row">
                  <div className="row">
                    <input
                      type="text"
                      className="form-control form-control-lg form-control-solid mb-3 mb-lg-0"
                      placeholder="Date"
                      value={data?.date ?? ""}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="row mb-6">
                <label className="col-lg-4 col-form-label fw-semibold fs-6">Time</label>
                <div className="col-lg-8">
                  <div className="row">
                    <div className="col-lg-6 fv-row">
                      <input
                        type="text"
                        className="form-control form-control-lg form-control-solid mb-3 mb-lg-0"
                        placeholder="Check-In"
                        value={data?.checkin ?? ""}
                        readOnly
                      />
                    </div>
                    <div className="col-lg-6 fv-row">
                      <input
                        type="text"
                        className="form-control form-control-lg form-control-solid"
                        placeholder="Check Out"
                        value={data?.checkout ?? ""}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-6">
                <label className="col-lg-4 col-form-label fw-semibold fs-6">Student's Name</label>
                <div className="col-lg-8 fv-row">
                  <input
                    type="text"
                    className="form-control form-control-lg form-control-solid"
                    placeholder="Name"
                    value={data?.name ?? ""}
                    readOnly
                  />
                </div>
              </div>

              <div className="row mb-6">
                <label className="col-lg-4 col-form-label fw-semibold fs-6">School</label>
                <div className="col-lg-8 fv-row">
                  <input
                    type="text"
                    className="form-control form-control-lg form-control-solid"
                    placeholder="School"
                    value={data?.school ?? ""}
                    readOnly
                  />
                </div>
              </div>

              <div className="row mb-6">
                <label className="col-lg-4 col-form-label fw-semibold fs-6">Status</label>
                <div className="col-lg-8 fv-row">
                  <input
                    type="text"
                    className="form-control form-control-lg form-control-solid"
                    placeholder="Status"
                    value={data?.status ?? ""}
                    readOnly
                  />
                </div>
              </div>

              <div className="row mb-6">
  <label className="col-lg-4 col-form-label fw-semibold fs-6">
    Remarks
  </label>

  <div className="col-lg-8 fv-row">
    {["Sick", "Family Matters", "Late", "Others"].map((option) => (
      <label
        key={option}
        className="form-check form-check-sm form-check-custom form-check-solid mb-3 me-5"
      >
        <input
          className="form-check-input"
          type="radio"
          name="remarks"
          value={option.toLowerCase()}
          checked={remarks === option.toLowerCase()}
          onChange={() => {
            setRemarks(option.toLowerCase());

            if (option !== "Others") {
              setRemarksInput("");
            }
          }}
        />

        <span className="form-check-label text-gray-600">
          {option}
        </span>
      </label>
    ))}

    {remarks === "others" && (
      <textarea
        className="form-control form-control-lg form-control-solid mt-3"
        placeholder="Please specify your remarks"
        value={remarksInput}
        onChange={(e) => setRemarksInput(e.target.value)}
      />
    )}
  </div>
</div>
            </div>

            {successMessage && (
  <div className="alert alert-success mx-9 mt-4">
    <i className="ki-duotone ki-check-circle fs-2 text-success me-2"></i>
    {successMessage}
  </div>
)}

{errorMessage && (
  <div className="alert alert-danger mx-9 mt-4">
    {errorMessage}
  </div>
)}

            <div className="card-footer d-flex justify-content-end py-6 px-9">
              <button
  type="button"
  className="btn btn-light btn-active-light-primary me-2"
  onClick={() => navigate(-1)}
>
  Discard
</button>
              <button
  type="submit"
  className="btn btn-primary"
  disabled={saving || !!successMessage}
>
  {saving ? "Saving..." : "Save Changes"}
</button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
