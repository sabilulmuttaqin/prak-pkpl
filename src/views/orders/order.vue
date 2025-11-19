<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import api from "../../api";

/* =========================
   State & constants
========================= */
const posts = ref([]);
const searchQuery = ref("");
const statusFilter = ref("");
const actingId = ref(null);

// Gambar dari PHP native
const UPLOADS_BASE = "http://localhost:1234";

/* =========================
   Utils
========================= */
function toImgUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const clean = String(path).replace(/^\/+/, "");
  return `${UPLOADS_BASE}/${clean}`;
}

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    const matchesSearch = post.nama
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value
      ? getStatus(post) === statusFilter.value
      : true;
    return matchesSearch && matchesStatus;
  });
});

function parseItems(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}
function formatItems(raw) {
  const items = parseItems(raw);
  if (!items.length) return "-";
  return items
    .map((it) => `${it.name || it.nama || "Item"} × ${Number(it.qty ?? 1)}`)
    .join(", ");
}

const formatIDR = (n) =>
  (Number(n) || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

/* =========================
   Status & permissions
========================= */
function getStatus(post) {
  const v = String(post?.validate ?? "")
    .trim()
    .toLowerCase();
  if (!v || v === "not yet" || v === "pending" || v === "-") return "-";
  if (v === "approved" || v === "rejected") return v;
  return v;
}

// "terkunci" = sudah approve/reject atau dikunci lokal setelah action
function isLocked(p) {
  return !!p.__locked || ["approved", "rejected"].includes(getStatus(p));
}

const canApprove = (p) => getStatus(p) === "-" && !isLocked(p);
const canReject = (p) => getStatus(p) === "-" && !isLocked(p);
// Delete selalu bisa (kecuali sedang acting)
const canDelete = (p) => true;

/* =========================
   Preview image (zoom)
========================= */
const previewSrc = ref("");
const previewOpen = ref(false);
function openPreview(src) {
  previewSrc.value = src;
  previewOpen.value = true;
}
function closePreview() {
  previewOpen.value = false;
  previewSrc.value = "";
}
function onEsc(e) {
  if (e.key === "Escape") closePreview();
}
onMounted(() => window.addEventListener("keydown", onEsc));
onBeforeUnmount(() => window.removeEventListener("keydown", onEsc));

/* =========================
   Pretty Confirm Modal (untuk Delete)
========================= */
const confirmOpen = ref(false);
const confirmOpts = ref({
  title: "Hapus Transaksi?",
  message: "Tindakan ini tidak bisa dibatalkan.",
  okText: "Ya, Hapus",
  cancelText: "Batal",
});
let _confirmResolver = null;

function askConfirm(opts = {}) {
  confirmOpts.value = {
    title: opts.title || "Hapus Transaksi?",
    message: opts.message || "Tindakan ini tidak bisa dibatalkan.",
    okText: opts.okText || "Ya, Hapus",
    cancelText: opts.cancelText || "Batal",
  };
  confirmOpen.value = true;
  return new Promise((resolve) => {
    _confirmResolver = resolve;
  });
}
function onConfirmOK() {
  confirmOpen.value = false;
  _confirmResolver?.(true);
  _confirmResolver = null;
}
function onConfirmCancel() {
  confirmOpen.value = false;
  _confirmResolver?.(false);
  _confirmResolver = null;
}

/* =========================
   Data
========================= */
async function fetchDataPosts() {
  const { data } = await api.get("/transaksis");
  posts.value = data.data.data;
}
onMounted(fetchDataPosts);

/* =========================
   Actions
========================= */
async function deletePost(id, post) {
  if (!canDelete(post)) return;

  const yes = await askConfirm({
    title: "Hapus transaksi ini?",
    message:
      `Nama: ${post.nama}\n` +
      `Total: ${formatIDR(post.total)}\n\n` +
      `Data akan dihapus permanen dari sistem.`,
    okText: "Ya, Hapus",
    cancelText: "Batal",
  });
  if (!yes) return;

  actingId.value = id;
  try {
    await api.delete(`/transaksis/${id}`);
    await fetchDataPosts();
  } finally {
    actingId.value = null;
  }
}

async function rejectPost(id, post) {
  if (!canReject(post)) return;
  if (!confirm("Tolak transaksi ini? Status akan menjadi 'rejected'.")) return;
  actingId.value = id;
  try {
    await api.patch(`/transaksis/${id}/status`, { validate: "rejected" });
    post.__locked = true;
    await fetchDataPosts();
  } finally {
    actingId.value = null;
  }
}

async function approvePost(post) {
  if (!canApprove(post)) return;
  if (!confirm("Setujui transaksi ini? Stok akan dikurangi.")) return;
  actingId.value = post.id;
  try {
    await api.patch(`/transaksis/${post.id}/status`, { validate: "approved" });
    await fetch(
      `http://localhost:1234/validate_order.php?id=${encodeURIComponent(
        post.id
      )}`
    );
    post.__locked = true;
    await fetchDataPosts();
  } finally {
    actingId.value = null;
  }
}
</script>

<template>
  <div class="container mb-5">
    <div class="row">
      <div class="col-md-12">
        <!-- Search and Filter Section -->
        <div class="card border-0 rounded shadow-sm mb-3">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-8">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="Cari nama customer..."
                />
              </div>
              <div class="col-md-4 d-flex justify-content-end">
                <select
                  v-model="statusFilter"
                  class="form-select"
                  style="width: auto"
                >
                  <option value="">Semua Status</option>
                  <option value="-">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="card border-0 rounded shadow">
          <div class="card-body">
            <table class="table table-hover table-striped align-middle">
              <thead class="bg-primary text-white">
                <tr>
                  <th>Nama</th>
                  <th>Alamat</th>
                  <th>No Telp</th>
                  <th>Email</th>
                  <th>Daftar Barang</th>
                  <th>Total</th>
                  <th>Bukti Transfer</th>
                  <th>Status</th>
                  <th style="width: 120px">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="filteredPosts.length === 0">
                  <td colspan="9" class="text-center">
                    <div class="alert alert-warning mb-0">
                      Data Not Available!
                    </div>
                  </td>
                </tr>

                <tr v-else v-for="post in filteredPosts" :key="post.id">
                  <td class="shrunk-text">{{ post.nama }}</td>
                  <td class="shrunk-text" style="white-space: pre-line">
                    {{ post.alamat }}
                  </td>
                  <td>{{ post.no_telp }}</td>
                  <td>{{ post.email }}</td>
                  <td>{{ formatItems(post.daftar_barang) }}</td>
                  <td>{{ post.total }}</td>

                  <td class="text-center">
                    <img
                      :src="toImgUrl(post.bukti_transfer)"
                      alt="Bukti Transfer"
                      class="img-thumb-click"
                      @click="openPreview(toImgUrl(post.bukti_transfer))"
                    />
                  </td>

                  <td>
                    <span
                      :class="[
                        'badge',
                        getStatus(post) === 'approved'
                          ? 'bg-success'
                          : getStatus(post) === 'rejected'
                          ? 'bg-danger'
                          : 'bg-secondary',
                      ]"
                    >
                      {{ getStatus(post) }}
                    </span>
                  </td>

                  <td>
                    <div class="d-flex flex-column gap-1 action-col">
                      <button
                        @click.prevent="approvePost(post)"
                        class="btn btn-success btn-xs rounded"
                        :disabled="
                          actingId === post.id ||
                          !canApprove(post) ||
                          isLocked(post)
                        "
                      >
                        {{ actingId === post.id ? "..." : "Approve" }}
                      </button>

                      <button
                        @click.prevent="rejectPost(post.id, post)"
                        class="btn btn-warning btn-xs rounded"
                        :disabled="
                          actingId === post.id ||
                          !canReject(post) ||
                          isLocked(post)
                        "
                      >
                        Reject
                      </button>

                      <button
                        @click.prevent="deletePost(post.id, post)"
                        class="btn btn-danger btn-xs rounded"
                        :disabled="actingId === post.id"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Modal preview image -->
            <div
              v-if="previewOpen"
              class="modal-backdrop"
              @click.self="closePreview"
            >
              <div class="modal-box">
                <button class="close-btn" @click="closePreview">×</button>
                <img :src="previewSrc" alt="Preview" class="modal-img" />
              </div>
            </div>

            <!-- Pretty Confirm Modal for Delete -->
            <div
              v-if="confirmOpen"
              class="cfr-backdrop"
              @click.self="onConfirmCancel"
            >
              <div class="cfr-card">
                <div class="cfr-icon">⚠️</div>
                <h5 class="cfr-title">{{ confirmOpts.title }}</h5>
                <p class="cfr-msg" style="white-space: pre-line">
                  {{ confirmOpts.message }}
                </p>
                <div class="cfr-actions">
                  <button class="btn btn-light" @click="onConfirmCancel">
                    {{ confirmOpts.cancelText }}
                  </button>
                  <button class="btn btn-danger" @click="onConfirmOK">
                    {{ confirmOpts.okText }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shrunk-text {
  font-size: 0.95rem;
  line-height: 1.1;
}

.img-thumb-click {
  width: 160px;
  height: auto;
  border-radius: 10px;
  cursor: zoom-in;
  border: 3px solid #e9ecef;
}

.btn-xs {
  padding: 0.3rem 0.55rem;
  font-size: 0.85rem;
}
.action-col {
  width: 110px;
}
.gap-1 {
  gap: 0.35rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
  z-index: 1050;
}
.modal-box {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: #111;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.modal-img {
  max-width: 86vw;
  max-height: 80vh;
  display: block;
  border-radius: 8px;
}
.close-btn {
  position: absolute;
  top: 6px;
  right: 10px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fff;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.cfr-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 2000;
}
.cfr-card {
  width: min(520px, 92vw);
  background: #fff;
  border-radius: 14px;
  padding: 22px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}
.cfr-icon {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #fff3cd;
  color: #b58105;
  display: grid;
  place-items: center;
  font-size: 26px;
  margin-bottom: 10px;
}
.cfr-title {
  margin: 0 0 6px;
  font-weight: 700;
}
.cfr-msg {
  color: #444;
  margin: 0 0 16px;
}
.cfr-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
