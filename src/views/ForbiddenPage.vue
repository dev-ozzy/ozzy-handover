<template>
  <div style="padding: 40px; text-align: center">
    <h1 style="font-size: 48px; margin-bottom: 10px; color: #d9534f">403</h1>
    <h2>Anda tidak punya akses ke halaman ini</h2>
    <p>Silakan kembali ke halaman utama.</p>

    <button
      @click="$router.push('/')"
      style="
        margin-top: 20px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
      "
    >
      Kembali
    </button>
  </div>
</template>
