
async function popularBanco() {
  try {
    console.log("⏳ Conectando ao Firebase...");

    // 1. Criando métricas do Dashboard
    await setDoc(doc(db, "dashboard", "metrics"), {
      usuarios_ativos: 154,
      total_pomodoros_app: 8902,
      leads_instagram: 1150,
      leads_linkedin: 850
    });
    console.log("✅ Métricas criadas!");

    // 2. Criando Usuários/Pets
    const usuarios = [
      { nome: "Eduardo", origem: "LinkedIn", nivel_pet: 15, xp_pet: 8500, evolution: "Adulto" },
      { nome: "Ana Paula", origem: "Instagram", nivel_pet: 8, xp_pet: 2300, evolution: "Filhote" },
      { nome: "Carlos Lima", origem: "WhatsApp", nivel_pet: 3, xp_pet: 450, evolution: "Ovo" }
    ];

    for (const u of usuarios) {
      await addDoc(collection(db, "users"), u);
    }
    
    console.log("🚀 TUDO PRONTO! O banco está recheado para a apresentação.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Erro ao popular banco:", e);
    process.exit(1);
  }
}

popularBanco();