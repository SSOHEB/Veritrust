import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Company } from "@/types";
import { app } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

const CompanyInfo: React.FC = () => {
  const auth = useMemo(() => getAuth(app), []);
  const db = useMemo(() => getFirestore(app), []);

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setError(null);
        setLoading(true);

        if (!user) {
          setCompany(null);
          setError("You must be signed in to view your company profile.");
          return;
        }

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as Partial<Company>;
          setCompany({
            id: user.uid,
            email: user.email || data.email || "",
            name: user.displayName || data.name || "",
            type: "company",
            createdAt: data.createdAt || new Date().toISOString(),
            companyName: data.companyName || user.displayName || "",
            industry: data.industry || "",
            size: data.size || "",
            description: data.description || "",
            website: data.website || "",
            logo: data.logo || "",
            verified: data.verified || false,
            verifiedAt: data.verifiedAt,
            verificationMethod: data.verificationMethod,
          });
          return;
        }

        const initial: Company = {
          id: user.uid,
          email: user.email || "",
          name: user.displayName || "",
          type: "company",
          createdAt: new Date().toISOString(),
          companyName: user.displayName || "",
          industry: "",
          size: "",
          description: "",
          website: "",
          logo: "",
          verified: false,
        };

        await setDoc(ref, initial, { merge: true });
        setCompany(initial);
      } catch (e) {
        console.error(e);
        setError("Failed to load company profile.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [auth, db]);

  const updateField = <K extends keyof Company>(key: K, value: Company[K]) => {
    setCompany((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSaving(true);

      const user = auth.currentUser;
      if (!user || !company) {
        setError("You must be signed in to save your company profile.");
        return;
      }

      const ref = doc(db, "users", user.uid);
      const payload: Company = {
        ...company,
        id: user.uid,
        email: user.email || company.email,
        name: user.displayName || company.name,
        type: "company",
        createdAt: company.createdAt || new Date().toISOString(),
      };

      await setDoc(ref, payload, { merge: true });
      setCompany(payload);
    } catch (e) {
      console.error(e);
      setError("Failed to save company profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    try {
      setError(null);
      setVerifying(true);

      const user = auth.currentUser;
      if (!user || !company) {
        setError("You must be signed in to verify your company.");
        return;
      }

      await new Promise((r) => setTimeout(r, 2000));

      const verifiedAt = new Date().toISOString();
      const update = {
        verified: true,
        verifiedAt,
        verificationMethod: "zk-simulation" as const,
      };

      const ref = doc(db, "users", user.uid);
      await setDoc(ref, update, { merge: true });

      setCompany((prev) => (prev ? { ...prev, ...update } : prev));
    } catch (e) {
      console.error(e);
      setError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">Loading company profile…</CardContent>
        </Card>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {error || "Company profile unavailable."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">
            Manage your company identity and verification status
          </p>
        </div>

        <div className="flex items-center gap-3">
          {company.verified ? (
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              Verified Entity
            </span>
          ) : null}

          <Button
            onClick={handleVerify}
            disabled={company.verified || verifying}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {company.verified
              ? "Verified"
              : verifying
                ? "Generating proof…"
                : "Verify Now"}
          </Button>
        </div>
      </div>

      {company.verified && company.verifiedAt ? (
        <div className="text-sm text-muted-foreground">
          Verified at: {company.verifiedAt}
        </div>
      ) : null}

      {error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Company Name</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                value={company.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                placeholder="Acme Inc."
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Industry</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                value={company.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                placeholder="Technology"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Company Size</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                value={company.size}
                onChange={(e) => updateField("size", e.target.value)}
                placeholder="10-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Website</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                value={company.website || ""}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full rounded-md border px-3 py-2"
              rows={5}
              value={company.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe your company…"
            />
          </div>

          <div className="flex items-center justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyInfo;
