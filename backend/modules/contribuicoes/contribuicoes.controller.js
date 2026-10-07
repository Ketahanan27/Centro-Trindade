// Payments remain unavailable until a real provider and verified confirmation exist.
export const createDonation = (_req, res) => res.status(503).json({
  message: "Os pagamentos online ainda não estão disponíveis. Contacte a igreja.",
});

export const getDonationStatus = (_req, res) => res.status(503).json({
  message: "Não existe um serviço de pagamentos online ativo.",
});

export default { createDonation, getDonationStatus };
