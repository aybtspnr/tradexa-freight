import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import {
  FileText,
  Upload,
  Download,
  Shield,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  CloudUpload,
} from "lucide-react";
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

const DOC_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "cte", label: "CT-e (Conhecimento de Transporte)" },
  { value: "mdfe", label: "MDF-e (Manifesto de Documentos Fiscais)" },
  { value: "ciot", label: "CIOT" },
  { value: "cnh", label: "CNH" },
  { value: "rnrtc", label: "RNTRC (ANTT)" },
  { value: "other", label: "Outro" },
];

interface Document {
  id: string;
  document_type: DocumentType;
  file_name: string | null;
  file_url: string;
  expiry_date: string | null;
  verified: boolean;
  created_at: string | null;
}

interface ChecklistItem {
  type: DocumentType;
  label: string;
  icon: typeof FileText;
}

const CHECKLIST: ChecklistItem[] = [
  { type: "rnrtc", label: "RNTRC (ANTT)", icon: Shield },
  { type: "cnh", label: "CNH dos Motoristas", icon: FileText },
  { type: "cte", label: "CT-e (Conhecimento de Transporte)", icon: FileText },
  { type: "mdfe", label: "MDF-e (Manifesto de Documentos Fiscais)", icon: FileText },
];

export function Documentos() {
  const profile = useAuthStore((s) => s.profile);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  /* ─── Modal / upload state ─── */
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>("other");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bucketReady, setBucketReady] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  /* ─── Carregar documentos ─── */
  const loadDocs = useCallback(async () => {
    if (!profile?.id) {
      setDocs([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("carrier_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar documentos:", error);
      setLoading(false);
      return;
    }
    setDocs((data || []) as Document[]);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  /* ─── Verificar se bucket existe ao abrir modal ─── */
  const openModal = useCallback(async () => {
    setModalOpen(true);
    setSelectedType("other");
    setFile(null);
    setErrorMsg("");
    setUploading(false);

    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error("Erro ao listar buckets:", error);
      setBucketReady(false);
      setErrorMsg(
        "Não foi possível verificar o Storage. Verifique sua conexão com o Supabase.",
      );
      return;
    }
    const exists = buckets?.some((b) => b.name === "documents");
    setBucketReady(exists ?? false);
    if (!exists) {
      setErrorMsg(
        "O bucket 'documents' não está configurado no Supabase Storage. Crie o bucket no dashboard do Supabase para habilitar uploads.",
      );
    }
  }, []);

  /* ─── Fechar modal ─── */
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setFile(null);
    setErrorMsg("");
    setUploading(false);
  }, []);

  /* ─── Upload ─── */
  const handleUpload = useCallback(async () => {
    if (!profile?.id || !file) return;
    if (bucketReady === false) return;

    setUploading(true);
    setErrorMsg("");

    const timestamp = Date.now();
    const safeName = file.name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    const path = `${profile.id}/${selectedType}_${timestamp}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Erro no upload:", uploadError);
      setErrorMsg(uploadError.message || "Erro ao fazer upload do arquivo.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(path);

    const fileUrl = urlData?.publicUrl || "";

    const { error: insertError } = await supabase.from("documents").insert({
      carrier_id: profile.id,
      document_type: selectedType,
      file_name: file.name,
      file_url: fileUrl,
      verified: false,
    });

    if (insertError) {
      console.error("Erro ao inserir documento:", insertError);
      setErrorMsg(
        insertError.message || "Erro ao salvar o documento no banco de dados.",
      );
      setUploading(false);
      return;
    }

    await loadDocs();
    setUploading(false);
    closeModal();
  }, [profile?.id, file, selectedType, bucketReady, loadDocs, closeModal]);

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
          <p className="text-gray-500">
            Gerencie a documentação da transportadora
          </p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Upload className="h-4 w-4" />
          Enviar Documento
        </button>
      </div>

      {/* Required docs checklist */}
      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Documentos Obrigatórios
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CHECKLIST.map((item) => {
            const hasDoc = docs.some((d) => d.document_type === item.type);
            const isVerified = docs.some(
              (d) => d.document_type === item.type && d.verified,
            );
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                className="flex items-center gap-3 rounded-lg border border-border p-4"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    hasDoc
                      ? isVerified
                        ? "bg-green-50"
                        : "bg-blue-50"
                      : "bg-amber-50"
                  }`}
                >
                  {hasDoc ? (
                    isVerified ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Icon className="h-5 w-5 text-blue-600" />
                    )
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {hasDoc
                      ? isVerified
                        ? "Verificado"
                        : "Enviado — aguardando verificação"
                      : "Pendente"}
                  </p>
                </div>
                {hasDoc && !isVerified && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    Pendente
                  </span>
                )}
                {hasDoc && isVerified && (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    OK
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents list */}
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Documentos Enviados
          </h2>
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
                    <td className="px-6 py-4 text-gray-700">
                      {doc.file_name || "—"}
                    </td>
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

      {/* ─── Upload Modal ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {/* Cabeçalho */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Enviar Documento
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="space-y-4">
              {/* Tipo de documento */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(e.target.value as DocumentType)
                  }
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  {DOC_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Arquivo */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">
                  Arquivo <span className="text-red-500">*</span>
                </label>
                <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-primary/50">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.xml"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                    id="doc-upload"
                  />
                  <label
                    htmlFor="doc-upload"
                    className="flex cursor-pointer flex-col items-center gap-2"
                  >
                    <CloudUpload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {file ? file.name : "Clique para selecionar um arquivo"}
                    </span>
                    <span className="text-xs text-gray-400">
                      PDF, imagens, Word, Excel ou XML. Máx. 50 MB.
                    </span>
                  </label>
                </div>
              </div>

              {/* Erro / config */}
              {errorMsg && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                onClick={closeModal}
                className="rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={
                  uploading || !file || bucketReady === false || !profile?.id
                }
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Enviar Documento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documentos;
