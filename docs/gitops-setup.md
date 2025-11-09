Ringkasan

- CI: build Node dependencies dan build image Docker untuk sanity check.
- CD: build & push image ke Docker Hub, lalu buka PR ke repo GitOps (Kustomize) untuk update tag image.

Prasyarat

- Repo ini di-host di GitHub.
- Aktifkan GitHub Actions.
- GitOps tool (FluxCD/Argo CD) sudah mengawasi repo manifests terpisah (disarankan pola 2-repo: source code terpisah dari manifests).

Registri Container (Docker Hub)

- Workflow mendorong image ke Docker Hub dengan nama `docker.io/<org_or_user>/<repo>`.
- Nama image default mengikuti `owner/repo` GitHub (huruf kecil). Anda bisa override dengan secret `DOCKERHUB_REPO`.

Rahasia (Secrets) yang perlu disetel di repo ini

1) Wajib untuk push ke Docker Hub:
- `DOCKERHUB_USERNAME`: username Docker Hub.
- `DOCKERHUB_TOKEN`: token/password Docker Hub (disarankan Access Token).
- Opsional: `DOCKERHUB_REPO`: nama repo image di Docker Hub (contoh: `myuser/k8s-my-app`). Jika tidak diisi, default `owner/repo` GitHub.

2) Wajib untuk GitOps PR:
- `GITOPS_REPO`: format `org/repo` dari repo manifests (contoh: `my-org/k8s-manifests`).
- `GITOPS_TOKEN`: token dengan akses write/PR ke repo manifests (PAT dengan scope `repo`).
- `KUSTOMIZE_DIR` atau `KUSTOMIZE_DIRS`: path direktori berisi `kustomization.yaml` yang akan di-update.
  - `KUSTOMIZE_DIR`: satu path (contoh: `overlays/dev`).
  - `KUSTOMIZE_DIRS`: multi-path dipisahkan koma atau newline (contoh: `overlays/dev,overlays/staging,overlays/prod`).
- `KUSTOMIZE_IMAGE_NAME`: nama image yang dipakai di kustomize (contoh: `my-app` atau `docker.io/myuser/k8s-my-app`).

3) Opsional:
- `GITOPS_BRANCH`: nama default branch repo manifests (default `main`).

Alur CD (GitOps)

1. On push ke `main` atau membuat tag `v*.*.*`:
   - Build image dan push ke `ghcr.io/<owner>/<repo>:` dengan beberapa tag (branch, tag, sha, latest).
   - Hitung tag kanonik untuk manifest: `main`, atau nama tag release, atau `sha-<7char>`.
2. Checkout repo GitOps dan jalankan `kustomize edit set image` di setiap direktori target (`KUSTOMIZE_DIR` atau `KUSTOMIZE_DIRS`) untuk menyetel `KUSTOMIZE_IMAGE_NAME=<image:tag>`.
3. Buat PR ke branch `GITOPS_BRANCH` dengan perubahan tersebut.

Contoh kustomization.yaml (cuplikan)

```yaml
images:
  - name: my-app
    newName: docker.io/myuser/k8s-my-app
    newTag: main
```

Catatan

- Jika Anda menggunakan Argo CD/Flux, arahkan aplikasi/helmrelease/kustomization mereka ke path `KUSTOMIZE_DIR` atau overlay yang relevan di repo manifests.
- KUSTOMIZE_IMAGE_NAME bisa berupa nama pendek (mis. `my-app`) atau fully-qualified (mis. `docker.io/myuser/k8s-my-app`). Pastikan konsisten dengan nilai di manifests.

Mapping cepat untuk struktur yang Anda kirim:
- Dev: set `KUSTOMIZE_DIR` = `overlays/dev`
- Staging: set `KUSTOMIZE_DIR` = `overlays/staging`
- Prod: set `KUSTOMIZE_DIR` = `overlays/prod`
Atau gunakan `KUSTOMIZE_DIRS` = `overlays/dev,overlays/staging,overlays/prod` bila ingin update semua sekaligus (umumnya kurang direkomendasikan untuk promotion bertahap).
