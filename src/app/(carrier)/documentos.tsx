import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { FileText, Upload, Download, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/utils/format";

type DocumentType = "cte" | "mdfe" | "ciot" | "cnh" | "rnrtc" | "other";

const DOC_TYPE_LABEL: Record<DocumentType, string> = {
  cte: "CT-e",
  mdfe: "MDF-e",
  ciot: "CIOT",
  cnh: "CNH",
  rnrtc: "RNTRC",
  other: "Outro",
};

interface Document {
  id: string;
  document_type: DocumentType;
  file_name: string | null;
  file_url: string;
  expiry_date: string | null;
  verified: boolean;
  created_at: string | null;
}

export function Documentos() {
  const profile = useAuthStore((s) => s.profile);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    supabase
      .from("documents")
      .select("*")
      .eq("carrier_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setDocs((data || []) as Document[]);
        setLoading(false);
      });
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-500">Gerencie a documentação da transportadora</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark">
          <Upload className="h-4 w-4" />
          Enviar Documento
        </button>
      </div>

      {/* Required docs checklist */}
      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Documentos Obrigatórios</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { type: "rnrtc" as const, label: "RNTRC (ANTT)", icon: Shield },
            { type: "cnh" as const, label: "CNH dos Motoristas", icon: FileText },
            { type: "cte" as const, label: "CT-e (Conhecimento de Transporte)", icon: FileText },
            { type: "mdfe" as const, label: "MDF-e (Manifesto de Documentos Fiscais)", icon: FileText },
          ].map((item) => {
            const hasDoc = docs.some((d) => d.document_type === item.type);
            return (
              <div key={item.type} className="flex items-center gap-3 rounded-lg border border-border p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${hasDoc ? "bg-green-50" : "bg-amber-50"}`}>
                  {hasDoc ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{hasDoc ? "Documentado" : "Pendente"}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents list */}
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Documentos Enviados</h2>
        </div>

        {docs.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <FileText className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm">Nenhum documento enviado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Arquivo</th>
                  <th className="px-6 py-3">Validade</th>
                  <th className="px-6 py-3">Verificado</th>
                  <th className="px-6 py-3">Enviado em</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {DOC_TYPE_LABEL[doc.document_type] || doc.document_type}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{doc.file_name || "—"}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {doc.expiry_date ? formatDate(doc.expiry_date) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {doc.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle2 className="h-3 w-3" /> Verificado
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600">Pendente</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {doc.created_at ? formatDate(doc.created_at) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark"
                      >
                        <Download className="h-3 w-3" /> Baixar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Documentos;
