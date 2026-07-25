import crypto from "crypto";

const donations = new Map();

export const createDonation = (req, res) => {
  const { nome, telemovel, valor, descricao } = req.body;
  if (!nome || !telemovel || !valor || Number(valor) <= 0) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  // IDs sequenciais/previsíveis (Date.now()) permitem IDOR: qualquer pessoa
  // consegue adivinhar o id de outra doação e consultar os dados pessoais
  // associados via GET /status/:id. Um UUID v4 não é adivinhável.
  const id = crypto.randomUUID();
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
  // Só devolve o mínimo necessário para consultar o estado — nome, telemóvel
  // e valor não devem ser expostos a quem apenas conhece o id da doação.
  return res.json({ id: donation.id, status: donation.status, createdAt: donation.createdAt });
};

export default {
  createDonation,
  getDonationStatus,
};