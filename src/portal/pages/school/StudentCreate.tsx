import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/portal/layouts/AppLayout";
import { Card } from "@/portal/components/Card";
import { api, ApiError } from "@/portal/api";
import { useEffect, useState } from "react";

interface SchoolClass {
  id: number;
  class_name: string;
}

interface SchoolGrade {
  id: number;
  grade_name: string;
  classes: SchoolClass[];
}

interface ClassNamesResponse {
  grades: SchoolGrade[];
}

interface ClassManagementResponse {
  allGrades: string[];
  activatedGrades: string[];
}

export default function StudentCreate() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [dob, setDob] = useState("");
  const [ic, setIc] = useState("");
  const [schoolGrades, setSchoolGrades] = useState<SchoolGrade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classError, setClassError] = useState("");
  const selectedGradeData = schoolGrades.find(
    (grade) => grade.grade_name === selectedGrade
  );

  const filteredClasses = selectedGradeData?.classes ?? [];

  useEffect(() => {
    let cancelled = false;

    async function loadSchoolGradesAndClasses() {
      try {
        setLoadingClasses(true);
        setClassError("");

        const [managementResponse, classResponse] = await Promise.all([
          api<ClassManagementResponse>(
            "/api/portal/school/class-management"
          ),
          api<ClassNamesResponse>(
            "/api/portal/class-names"
          ),
        ]);

        if (cancelled) return;

        const activated = new Set(
          managementResponse.activatedGrades ?? []
        );

        const registeredGrades = (classResponse.grades ?? []).filter(
          (grade) => activated.has(grade.grade_name)
        );

        setSchoolGrades(registeredGrades);

        console.log("School grades and classes:", registeredGrades);
      } catch (error) {
        if (!cancelled) {
          console.error("Unable to load school classes:", error);
          setClassError("Unable to load registered grades and classes.");
        }
      } finally {
        if (!cancelled) {
          setLoadingClasses(false);
        }
      }
    }

    loadSchoolGradesAndClasses();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleIcChange(value: string) {
    setIc(value);

    const digits = value.replace(/\D/g, "");

    if (digits.length !== 12) {
      setDob("");
      return;
    }

    const yy = parseInt(digits.substring(0, 2), 10);
    const mm = parseInt(digits.substring(2, 4), 10);
    const dd = parseInt(digits.substring(4, 6), 10);

    const currentYear = new Date().getFullYear();
    const currentYY = currentYear % 100;

    const year = yy <= currentYY ? 2000 + yy : 1900 + yy;

    const date = new Date(year, mm - 1, dd);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== mm - 1 ||
      date.getDate() !== dd ||
      date > new Date()
    ) {
      setDob("");
      return;
    }

    setDob(
      `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};

    fd.forEach((v, k) => {
      body[k] = typeof v === "string" ? v.trim() : v;
    });

    // Check whether at least one parent/guardian has been provided
    const hasFather = Boolean(body.father_name);
    const hasMother = Boolean(body.mother_name);
    const hasGuardian = Boolean(body.guardian_name);

    if (!hasFather && !hasMother && !hasGuardian) {
      setErrors({
        parent_guardian: [
          "Please provide at least one parent or guardian (Father, Mother, or Guardian).",
        ],
      });
      return;
    }

    // Validate required information for each person provided
    const guardianErrors: Record<string, string[]> = {};

    const persons = [
      { prefix: "father", label: "Father" },
      { prefix: "mother", label: "Mother" },
      { prefix: "guardian", label: "Guardian" },
    ];

    for (const person of persons) {
      const fields = ["name", "ic", "phone", "email"];

      const hasAnyField = fields.some(
        (field) => Boolean(body[`${person.prefix}_${field}`])
      );

      if (!hasAnyField) continue;

      if (hasAnyField && !body[`${person.prefix}_name`]) {
        guardianErrors[`${person.prefix}_name`] = [
          `${person.label} name is required when providing ${person.label.toLowerCase()} information.`,
        ];
      }
    }

    if (Object.keys(guardianErrors).length > 0) {
      setErrors(guardianErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await api("/api/portal/students", {
        method: "POST",
        body,
      });

      navigate("/school/students");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({
          general: ["Unable to register student. Please try again."],
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout title="Add Student" role="school">
      <Card>
        <h3 className="mb-4">Add Student</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" name="name" required />
          </div>

          <div className="mb-3">
            <label className="form-label">IC/MyKid</label>

            <input
              type="text"
              className="form-control"
              name="ic"
              value={ic}
              onChange={(e) => handleIcChange(e.target.value)}
              placeholder="YYMMDD-XX-XXXX"
              maxLength={14}
              required
            />

            <small className="text-muted">
              Date of birth will be filled automatically from IC/MyKid.
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Birth Cert No</label>
            <input type="text" className="form-control" name="birth_cert_no" />
          </div>

          <div className="mb-3">
            <label className="form-label">Address</label>
            <input type="text" className="form-control" name="address" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Date of Birth</label>

            <input
              type="date"
              className="form-control"
              name="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />

            <small className="text-muted">
              Automatically generated from IC/MyKid. You can edit it manually if needed.
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Gender</label>
            <select name="gender" className="form-select" required defaultValue="">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Grade</label>

            <select
              className="form-select"
              name="grade"
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedClass("");
              }}
              disabled={loadingClasses || !!classError}
              required
            >
              <option value="">
                {loadingClasses ? "Loading grades..." : "Select Grade"}
              </option>

              {schoolGrades.map((grade) => (
                <option key={grade.id} value={grade.grade_name}>
                  {grade.grade_name}
                </option>
              ))}
            </select>

            {classError && (
              <small className="text-danger">{classError}</small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Class</label>

            <select
              className="form-select"
              name="class_name"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={
                !selectedGrade ||
                loadingClasses ||
                !!classError ||
                filteredClasses.length === 0
              }
              required
            >
              <option value="">
                {!selectedGrade
                  ? "Select Grade First"
                  : filteredClasses.length === 0
                    ? "No classes registered"
                    : "Select Class"}
              </option>

              {filteredClasses.map((schoolClass) => (
                <option
                  key={schoolClass.id}
                  value={schoolClass.class_name}
                >
                  {schoolClass.class_name}
                </option>
              ))}
            </select>

            {classError && (
              <div className="text-danger fs-7 mt-2">
                {classError}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Race</label>
            <select name="race" className="form-select" required defaultValue="">
              <option value="">Select Race</option>
              <option value="Malay">Malay</option>
              <option value="Chinese">Chinese</option>
              <option value="Indian">Indian</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Religion</label>
            <select name="religion" className="form-select" required defaultValue="">
              <option value="">Select Religion</option>
              <option value="Islam">Islam</option>
              <option value="Christianity">Christianity</option>
              <option value="Buddhism">Buddhism</option>
              <option value="Hinduism">Hinduism</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Nationality</label>
            <select name="nationality" className="form-select" required defaultValue="">
              <option value="">Select Nationality</option>
              <option value="Malaysian">Malaysian</option>
              <option value="Non-Malaysian">Non-Malaysian</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Orphan</label>
            <select name="orphan" className="form-select" required defaultValue="">
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">OKU</label>
            <select name="oku" className="form-select" required defaultValue="">
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <hr className="my-5" />
          <h3 className="mb-4 fw-bold">Maklumat Ibu Bapa/Penjaga</h3>

          <div className="mb-5">
            <h4 className="mb-4 fw-semibold">Bapa</h4>
            <div className="mb-3">
              <label className="form-label">Nama Bapa</label>
              <input type="text" className="form-control form-control-lg" name="father_name" />
            </div>
            <div className="mb-3">
              <label className="form-label">IC Bapa</label>
              <input type="text" className="form-control form-control-lg" name="father_ic" />
            </div>
            <div className="mb-3">
              <label className="form-label">No. Telefon Bapa</label>
              <input type="text" className="form-control form-control-lg" name="father_phone" />
            </div>
            <div className="mb-3">
              <label className="form-label">Email Bapa</label>
              <input type="email" className="form-control form-control-lg" name="father_email" />
            </div>
          </div>

          <div className="mb-5">
            <h4 className="mb-4 fw-semibold">Ibu</h4>
            <div className="mb-3">
              <label className="form-label">Nama Ibu</label>
              <input type="text" className="form-control form-control-lg" name="mother_name" />
            </div>
            <div className="mb-3">
              <label className="form-label">IC Ibu</label>
              <input type="text" className="form-control form-control-lg" name="mother_ic" />
            </div>
            <div className="mb-3">
              <label className="form-label">No. Telefon Ibu</label>
              <input type="text" className="form-control form-control-lg" name="mother_phone" />
            </div>
            <div className="mb-3">
              <label className="form-label">Email Ibu</label>
              <input type="email" className="form-control form-control-lg" name="mother_email" />
            </div>
          </div>

          <div className="mb-5">
            <h4 className="mb-4 fw-semibold">Penjaga</h4>
            <div className="mb-3">
              <label className="form-label">Nama Penjaga</label>
              <input type="text" className="form-control form-control-lg" name="guardian_name" />
            </div>
            <div className="mb-3">
              <label className="form-label">IC Penjaga</label>
              <input type="text" className="form-control form-control-lg" name="guardian_ic" />
            </div>
            <div className="mb-3">
              <label className="form-label">No. Telefon Penjaga</label>
              <input type="text" className="form-control form-control-lg" name="guardian_phone" />
            </div>
            <div className="mb-3">
              <label className="form-label">Email Penjaga</label>
              <input type="email" className="form-control form-control-lg" name="guardian_email" />
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="alert alert-danger">
              <ul className="mb-0">
                {Object.values(errors).flat().map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={submitting}>Add Student</button>
          <a href="/school/dashboard" className="btn btn-secondary ms-2">Cancel</a>
        </form>
      </Card>
    </AppLayout>
  );
}
