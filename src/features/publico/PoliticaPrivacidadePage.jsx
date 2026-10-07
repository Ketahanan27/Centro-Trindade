import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import "./styles/legal.css";

function PoliticaPrivacidade() {
  return (
    <Layout>
      <div className="container legal-page">

        <div className="legal-header">
          <h1>Política de Privacidade</h1>
          <p className="legal-updated">Última atualização: 25 de julho de 2026</p>
        </div>

        <section>
          <h2>1. Introdução</h2>
          <p>
            O Centro Trindade ("nós", "a igreja") respeita a privacidade de quem visita este site,
            participa na comunidade ou utiliza o sistema de gestão interna (ERP). Esta Política de
            Privacidade explica que dados pessoais recolhemos, para que finalidades os usamos,
            durante quanto tempo os guardamos e quais os seus direitos enquanto titular dos dados,
            em conformidade com o Regulamento (UE) 2016/679 — Regulamento Geral sobre a Proteção
            de Dados ("RGPD") — e com a Lei n.º 58/2019, de 8 de agosto, que assegura a sua
            execução na ordem jurídica portuguesa.
          </p>
          <p>
            Esta política aplica-se ao website público, ao formulário de doações, ao formulário de
            contacto e à área reservada do sistema (utilizada por membros, secretaria, tesouraria
            e liderança).
          </p>
        </section>

        <section>
          <h2>2. Quem é o responsável pelo tratamento dos dados</h2>
          <p>
            O responsável pelo tratamento dos dados recolhidos através deste site e do sistema
            interno é o <strong>Centro Trindade</strong>. Para qualquer questão relacionada com
            esta política ou com os seus dados pessoais, pode contactar-nos através dos meios
            indicados na secção 12.
          </p>
          <p>
            Dada a natureza e a escala reduzida do tratamento de dados que realizamos, não somos
            legalmente obrigados a designar um Encarregado de Proteção de Dados (EPD/DPO) nos
            termos do artigo 37.º do RGPD. Ainda assim, indicamos na secção 12 um contacto
            específico para questões de proteção de dados.
          </p>
        </section>

        <section>
          <h2>3. Que dados pessoais recolhemos</h2>
          <p>Recolhemos diferentes dados consoante a forma como interage connosco:</p>

          <h3>3.1. Visitantes do website</h3>
          <ul>
            <li>Dados enviados através do formulário de contacto: nome, email, telemóvel (opcional), assunto e mensagem.</li>
            <li>Dados enviados através do formulário de doação: nome, telemóvel, valor e descrição da doação.</li>
          </ul>

          <h3>3.2. Membros da comunidade</h3>
          <ul>
            <li>Identificação: nome, data de nascimento, sexo, estado civil.</li>
            <li>Contacto: email, telemóvel, morada e código postal.</li>
            <li>Vida na comunidade: data de entrada, se é batizado, estado (ativo/inativo) e fotografia de perfil.</li>
          </ul>

          <h3>3.3. Visitantes registados na secretaria</h3>
          <ul>
            <li>Nome, telefone, email, data da visita, quem convidou e observações da secretaria.</li>
          </ul>

          <h3>3.4. Contas de acesso ao sistema</h3>
          <ul>
            <li>Nome, email, palavra-passe (guardada sempre de forma encriptada, nunca em texto simples) e perfil de acesso (ex.: Administrador, Secretaria, Tesouraria, Pastor, Membro).</li>
          </ul>

          <h3>3.5. Registos internos da igreja</h3>
          <ul>
            <li>Atas de reuniões, documentos administrativos e movimentos financeiros (dízimos, ofertas e despesas), geridos apenas por perfis autorizados.</li>
          </ul>
        </section>

        <section>
          <h2>4. Dados sensíveis, crença religiosa e o artigo 9.º do RGPD</h2>
          <div className="legal-note">
            <p>
              Pela própria natureza de uma comunidade religiosa, os dados de membros estão
              associados à sua filiação religiosa — uma categoria especial de dados pessoais nos
              termos do artigo 9.º, n.º 1, do RGPD, que exige uma proteção reforçada.
            </p>
          </div>
          <p>
            O RGPD prevê, no artigo 9.º, n.º 2, alínea d), uma exceção específica para organizações
            religiosas sem fins lucrativos: podemos tratar estes dados no âmbito das nossas
            atividades legítimas e com as devidas garantias, desde que o tratamento diga respeito
            apenas aos nossos membros (ou antigos membros) ou a pessoas que mantenham contactos
            regulares com a igreja em razão das suas finalidades, e desde que os dados não sejam
            divulgados fora da igreja sem o consentimento dos titulares. É nesta base — e,
            complementarmente, no consentimento dado ao inscrever-se como membro — que assenta o
            tratamento dos dados de filiação religiosa.
          </p>
          <p>
            Não partilhamos esta informação com terceiros para fins comerciais ou publicitários.
          </p>
        </section>

        <section>
          <h2>5. Menores de idade</h2>
          <p>
            Em Portugal, a Lei n.º 58/2019 fixa em 13 anos a idade a partir da qual uma criança
            pode, por si só, consentir no tratamento dos seus dados pessoais no contexto de
            serviços da sociedade da informação. Para crianças com menos de 13 anos, qualquer
            tratamento direto dos seus dados depende do consentimento dos pais ou tutores legais.
          </p>
          <p>
            O registo de "apresentações de crianças" no sistema guarda apenas a data, o número de
            crianças apresentadas nesse dia e observações gerais da secretaria — não guarda nomes
            nem outros dados identificativos das crianças. Caso uma criança seja também registada
            como membro, é sempre com o consentimento e sob a responsabilidade dos pais ou
            tutores legais.
          </p>
        </section>

        <section>
          <h2>6. Para que finalidades usamos os seus dados</h2>
          <ul>
            <li>Gerir o registo de membros, visitantes e a vida administrativa da igreja;</li>
            <li>Responder a mensagens enviadas através do formulário de contacto;</li>
            <li>Processar e acompanhar doações;</li>
            <li>Criar e proteger o acesso de utilizadores ao sistema interno, de acordo com o seu perfil;</li>
            <li>Emitir documentos oficiais e relatórios internos da igreja;</li>
            <li>Cumprir obrigações legais e contabilísticas aplicáveis a uma organização sem fins lucrativos.</li>
          </ul>
        </section>

        <section>
          <h2>7. Fundamentos de licitude do tratamento (artigo 6.º do RGPD)</h2>
          <ul>
            <li><strong>Consentimento</strong> (art. 6.º, n.º 1, al. a): ao preencher um formulário, ao inscrever-se como membro ou ao criar uma conta no sistema.</li>
            <li><strong>Execução de uma relação estabelecida com o titular</strong> (al. b): para prestar apoio administrativo e pastoral aos membros da comunidade.</li>
            <li><strong>Cumprimento de obrigação legal</strong> (al. c): nomeadamente obrigações contabilísticas e fiscais aplicáveis a uma organização sem fins lucrativos.</li>
            <li><strong>Interesse legítimo</strong> (al. f): para a gestão administrativa corrente e a segurança do sistema, sempre ponderado com os seus direitos e liberdades.</li>
            <li>Para dados sobre filiação religiosa: a exceção específica do art. 9.º, n.º 2, al. d), descrita na secção 4.</li>
          </ul>
        </section>

        <section>
          <h2>8. Com quem partilhamos os seus dados</h2>
          <p>
            Não vendemos nem partilhamos os seus dados pessoais com terceiros para fins
            comerciais. Os únicos serviços externos envolvidos no tratamento dos dados são:
          </p>
          <ul>
            <li>O serviço de email (Gmail/Google) usado exclusivamente para enviar as respostas ao formulário de contacto e as notificações de conta (ex.: recuperação de palavra-passe);</li>
            <li>O nosso fornecedor de alojamento/base de dados, que armazena a informação em nosso nome, sob as mesmas obrigações de confidencialidade.</li>
          </ul>
          <p>
            O envio de emails através do Gmail pode implicar uma transferência de dados para fora
            do Espaço Económico Europeu, na medida em que a Google LLC tem sede nos EUA. Esta
            transferência assenta nas garantias adequadas oferecidas pela própria Google enquanto
            entidade aderente ao EU-U.S. Data Privacy Framework e/ou em Cláusulas
            Contratuais-Tipo aprovadas pela Comissão Europeia, consoante aplicável.
          </p>
          <p>
            Podemos ainda divulgar dados quando exigido por lei ou por uma autoridade competente.
          </p>
        </section>

        <section>
          <h2>9. Como protegemos os seus dados</h2>
          <ul>
            <li>As palavras-passe nunca são guardadas em texto simples — são sempre encriptadas.</li>
            <li>O acesso ao sistema interno é protegido por autenticação e limitado ao que cada perfil de utilizador necessita para o seu trabalho (princípio da minimização e do menor privilégio, art. 5.º, n.º 1, al. c) do RGPD).</li>
            <li>Existem limites de frequência de pedidos (rate limiting) para reduzir o risco de abuso automatizado.</li>
            <li>O acesso a dados financeiros e a dados de membros está restrito aos perfis com necessidade legítima de os ver.</li>
          </ul>
          <p>
            Nenhum sistema é 100% imune a incidentes de segurança. Caso ocorra uma violação de
            dados pessoais que envolva risco para os seus direitos e liberdades, notificaremos a
            CNPD no prazo de 72 horas, nos termos do artigo 33.º do RGPD, e informá-lo-emos
            diretamente sempre que a lei o exija.
          </p>
        </section>

        <section>
          <h2>10. Durante quanto tempo guardamos os dados</h2>
          <p>
            Guardamos os dados de membros e de registos internos enquanto a pessoa mantiver
            ligação à comunidade e pelo período adicional necessário para cumprir obrigações
            legais, contabilísticas ou de arquivo histórico da igreja. As mensagens de contacto e
            os dados de doações são conservados apenas pelo tempo necessário para responder ao
            pedido ou processar a doação, salvo obrigação legal de conservação mais longa. Aplicamos
            sempre o princípio da limitação da conservação previsto no artigo 5.º, n.º 1, al. e), do
            RGPD.
          </p>
        </section>

        <section>
          <h2>11. Os seus direitos</h2>
          <p>Enquanto titular dos dados, tem o direito de, a qualquer momento, solicitar-nos:</p>
          <ul>
            <li>Acesso aos dados pessoais que temos sobre si;</li>
            <li>Retificação de dados incorretos, incompletos ou desatualizados;</li>
            <li>Apagamento dos seus dados, quando não exista outra obrigação legal que justifique a sua conservação;</li>
            <li>Limitação do tratamento em determinadas circunstâncias;</li>
            <li>Portabilidade dos dados que nos forneceu, num formato estruturado e de uso corrente;</li>
            <li>Oposição ao tratamento baseado em interesse legítimo.</li>
          </ul>
          <p>
            O exercício destes direitos é gratuito. Respondemos ao seu pedido no prazo de um mês
            a contar da receção, prazo que pode ser prorrogado por mais dois meses em casos
            complexos, informando-o sempre desse facto.
          </p>
          <div className="legal-contacto">
            <p>
              Para exercer qualquer um destes direitos, contacte-nos através do email{" "}
              <a href="mailto:contato@trindade3oficial.com">contato@trindade3oficial.com</a> ou
              através do <Link to="/formulario">formulário de contacto</Link> do site. Tem
              também o direito de apresentar reclamação junto da autoridade de controlo
              portuguesa — a{" "}
              <a href="https://www.cnpd.pt" target="_blank" rel="noreferrer">
                Comissão Nacional de Proteção de Dados (CNPD)
              </a> — caso considere que o tratamento dos seus dados viola o RGPD.
            </p>
          </div>
        </section>

        <section>
          <h2>12. Cookies e armazenamento local no navegador</h2>
          <p>
            Este website não utiliza cookies de publicidade nem de rastreamento de terceiros. O
            sistema interno guarda, apenas no navegador de quem tem sessão iniciada, um
            identificador técnico de sessão estritamente necessário para manter o acesso
            autenticado — este tipo de armazenamento está dispensado de consentimento prévio nos
            termos da legislação sobre cookies (transposição da Diretiva ePrivacy), por ser
            indispensável à prestação do serviço solicitado. O website público pode ainda conter
            vídeos incorporados e ligações a redes sociais (YouTube, Instagram) que, quando
            visitados diretamente, seguem as suas próprias políticas de privacidade e de cookies.
          </p>
        </section>

        <section>
          <h2>13. Alterações a esta política</h2>
          <p>
            Esta política pode ser atualizada periodicamente para refletir alterações no sistema
            ou na legislação aplicável. A data da última atualização está sempre indicada no topo
            desta página.
          </p>
        </section>

        <Link to="/" className="legal-back">
          <i className="ri-arrow-left-line"></i> Voltar à página inicial
        </Link>

      </div>
    </Layout>
  );
}

export default PoliticaPrivacidade;
