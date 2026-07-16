const donations = new Map();

export const createDonation = (req, res) => {
  const { nome, telemovel, valor, descricao } = req.body;
  if (!nome || !telemovel || !valor || Number(valor) <= 0) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const id = String(Date.now());
  const pspId = `mock-${id}`;
  const donation = {
    id,
    nome,
    telemovel,
    valor: Number(valor),
    descricao,
    status: "PENDENTE",
    pspId,
    createdAt: new Date().toISOString(),
  };

  donations.set(id, donation);

  return res.json({ donationId: id, status: donation.status, pspId });
};

export const getDonationStatus = (req, res) => {
  const { id } = req.params;
  const donation = donations.get(id);
  if (!donation) return res.status(404).json({ error: "Not found" });
  return res.json(donation);
};

export const simulateConfirm = (req, res) => {
  const { id } = req.params;
  const donation = donations.get(id);
  if (!donation) return res.status(404).json({ error: "Not found" });
  donation.status = "PAGO";
  donation.paidAt = new Date().toISOString();
  donations.set(id, donation);
  return res.json({ ok: true, donation });
};

export default {
  createDonation,
  getDonationStatus,
  simulateConfirm,
};
