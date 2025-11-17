import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

const getTimestamp = (doc) =>
  doc?.submittedAt || doc?.updatedAt || doc?.createdAt || null;

const normalizeDateOnly = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.length === 10 && !value.includes("T")) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const offsetMinutes = parsed.getTimezoneOffset();
  const adjusted = new Date(parsed.getTime() - offsetMinutes * 60000);
  return adjusted.toISOString().split("T")[0];
};

export function useSensorySectionLock({
  patientId,
  testDate,
  category,
  initialResponses,
  initialComments,
}) {
  const [existingSection, setExistingSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasInitialResponses =
    Array.isArray(initialResponses) && initialResponses.length > 0;

  const shouldFetchExisting = useMemo(() => {
    return (
      !hasInitialResponses &&
      Boolean(patientId && testDate && category)
    );
  }, [hasInitialResponses, patientId, testDate, category]);

  const fetchExistingSection = useCallback(async () => {
    if (!patientId || !testDate || !category) return null;
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/assessments/sensory-profile", {
        params: {
          patientId,
          category,
          testDate: normalizeDateOnly(testDate),
        },
      });
      const docArray = Array.isArray(response.data) ? response.data : [];
      const doc = docArray[0] || null;
      setExistingSection(doc);
      return doc;
    } catch (err) {
      console.error("Failed to check existing sensory section:", err);
      setError("Unable to load previous responses for this section.");
      setExistingSection(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [patientId, testDate, category]);

  useEffect(() => {
    if (!shouldFetchExisting) {
      setExistingSection(null);
      return;
    }

    let isActive = true;
    const checkExisting = async () => {
      const doc = await fetchExistingSection();
      if (!isActive) return;
      setExistingSection(doc);
    };
    checkExisting();

    return () => {
      isActive = false;
    };
  }, [shouldFetchExisting, fetchExistingSection]);

  const timestamp = existingSection ? getTimestamp(existingSection) : null;
  const isWithinWindow =
    timestamp &&
    Date.now() - new Date(timestamp).getTime() < FIVE_HOURS_MS;
  const sectionExists = Boolean(existingSection);
  const isLocked = sectionExists && !isWithinWindow;

  const resolvedResponses = hasInitialResponses
    ? initialResponses
    : existingSection?.responses || null;

  const resolvedComments =
    hasInitialResponses && typeof initialComments === "string"
      ? initialComments
      : existingSection?.comments ?? initialComments ?? "";

  const statusMessage = sectionExists
    ? isLocked
      ? "This section was already submitted more than 5 hours ago and is now locked for this test date."
      : "Previous responses were found. You can keep editing them for up to 5 hours after submission."
    : "";

  return {
    loading,
    error,
    resolvedResponses,
    resolvedComments,
    isLocked,
    sectionExists,
    statusMessage,
    timestamp,
    refreshSection: fetchExistingSection,
  };
}
