import crypto from "crypto";

const donations = new Map();

export const createDonation = (req, res) => {
  const { nome, telemovel, valor, descricao } = req.body;
  if (!nome || !telemovel || !valor || Number(valor) <= 0) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  /*
  |--------------------------------------------------------------------------
  | Identificador da doação
  |--------------------------------------------------------------------------
  |
  | Um UUID v4 é usado em vez de um id sequencial/previsível (ex.: Date.now())
  | precisamente porque este endpoint de consulta é público: um id adivinhável
  | permitiria a qualquer pessoa consultar dados de outra doação via
  | GET /status/:id (IDOR).
  |
  */
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

  /* Só o mínimo necessário para consultar o estado — nome, telemóvel e valor não devem ser expostos aqui. */
  return res.json({ id: donation.id, status: donation.status, createdAt: donation.createdAt });
};

export default {
  createDonation,
  getDonationStatus,
};
