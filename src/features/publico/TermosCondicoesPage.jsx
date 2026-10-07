import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import "./styles/legal.css";

function TermosCondicoes() {
  return (
    <Layout>
      <div className="container legal-page">

        <div className="legal-header">
          <h1>Termos e Condições</h1>
          <p className="legal-updated">Última atualização: 25 de julho de 2026</p>
        </div>

        <section>
          <h2>1. Aceitação dos termos</h2>
          <p>
            Ao aceder e utilizar o website e o sistema interno do Centro Trindade, concorda com
            estes Termos e Condições. Se não concordar com algum dos pontos aqui descritos, deve
            interromper a utilização do site e do sistema.
          </p>
        </section>

        <section>
          <h2>2. Quem somos</h2>
          <p>
            O Centro Trindade é uma comunidade religiosa que disponibiliza este website e um
            sistema interno de gestão (ERP) para apoiar a organização das suas atividades
            administrativas, pastorais e financeiras.
          </p>
        </section>

        <section>
          <h2>3. Utilização do site e do sistema</h2>
          <p>
            O website é de acesso público e disponibiliza informação sobre a igreja, eventos,
            formulários de contacto e de doação. A área reservada do sistema destina-se apenas a
            membros, colaboradores e liderança devidamente autorizados, cada um com acesso
            limitado às funcionalidades correspondentes ao seu perfil (Administrador, Secretaria,
            Tesouraria, Pastor ou Membro).
          </p>
          <p>Ao utilizar o site e o sistema, compromete-se a:</p>
          <ul>
            <li>Fornecer informação verdadeira e atualizada nos formulários e no registo de conta;</li>
            <li>Não tentar aceder a áreas, dados ou funcionalidades para as quais não tem autorização;</li>
            <li>Não utilizar o site ou o sistema para fins ilícitos, fraudulentos ou que prejudiquem terceiros.</li>
          </ul>
        </section>

        <section>
          <h2>4. Contas de utilizador</h2>
          <p>
            O acesso à área reservada requer uma conta pessoal e intransmissível. É responsável
            por manter a confidencialidade da sua palavra-passe e por todas as ações realizadas
            através da sua conta. Deve informar-nos imediatamente caso suspeite de acesso não
            autorizado à sua conta. A igreja reserva-se o direito de suspender ou eliminar contas
            em caso de utilização indevida do sistema.
          </p>
        </section>

        <section>
          <h2>5. Doações</h2>
          <div className="legal-note">
            <p>
              O módulo de doações encontra-se atualmente em fase de desenvolvimento/demonstração
              e não processa pagamentos reais através de uma entidade bancária ou processador de
              pagamentos externo. Antes de disponibilizar este módulo para doações reais, será
              integrado um processador de pagamentos licenciado, e estes termos serão
              atualizados em conformidade, nomeadamente com o Decreto-Lei n.º 7/2004 (comércio
              eletrónico) e demais legislação de proteção do consumidor aplicável.
            </p>
          </div>
          <p>
            Quando o sistema de doações reais estiver ativo, as doações realizadas à igreja são,
            regra geral, voluntárias e não reembolsáveis, salvo erro comprovado no processamento.
            Não sendo uma compra de bens ou serviços, o direito de livre resolução previsto na
            legislação sobre contratos à distância (Decreto-Lei n.º 24/2014) não se aplica, por
            regra, a este tipo de contribuição.
          </p>
        </section>

        <section>
          <h2>6. Formulário de contacto e comunicações</h2>
          <p>
            Ao submeter o formulário de contacto, autoriza-nos a responder à sua mensagem através
            do email indicado. Não utilizamos os dados de contacto para envio de comunicações
            comerciais não solicitadas.
          </p>
        </section>

        <section>
          <h2>7. Propriedade intelectual</h2>
          <p>
            Os textos, imagens, logótipos e restante conteúdo publicado neste website pertencem
            ao Centro Trindade ou são utilizados com a devida autorização, sendo protegidos nos
            termos do Código do Direito de Autor e dos Direitos Conexos. Não é permitida a
            reprodução, distribuição ou utilização comercial deste conteúdo sem autorização
            prévia por escrito.
          </p>
        </section>

        <section>
          <h2>8. Limitação de responsabilidade</h2>
          <p>
            Fazemos um esforço razoável para manter a informação do site correta e atualizada e
            o sistema disponível e seguro, mas não garantimos que o serviço esteja livre de
            interrupções, erros ou falhas técnicas. Na medida permitida por lei, o Centro
            Trindade não se responsabiliza por danos indiretos resultantes da utilização ou
            impossibilidade de utilização do site ou do sistema.
          </p>
        </section>

        <section>
          <h2>9. Cláusulas contratuais gerais</h2>
          <p>
            Estes Termos e Condições são redigidos de forma clara e acessível, em observância
            dos princípios de boa-fé e transparência exigidos pelo regime jurídico das cláusulas
            contratuais gerais (Decreto-Lei n.º 446/85, de 25 de outubro). Nenhuma disposição
            destes termos pretende excluir ou limitar direitos que a lei portuguesa lhe atribua
            de forma imperativa.
          </p>
        </section>

        <section>
          <h2>10. Ligações a sites de terceiros</h2>
          <p>
            O website pode conter ligações para plataformas de terceiros (por exemplo, YouTube e
            Instagram). Não somos responsáveis pelo conteúdo ou pelas práticas de privacidade
            desses sites, que têm os seus próprios termos e políticas.
          </p>
        </section>

        <section>
          <h2>11. Alterações a estes termos</h2>
          <p>
            Podemos atualizar estes Termos e Condições periodicamente, para refletir alterações
            no sistema, nos serviços disponibilizados ou na legislação aplicável. A data da
            última atualização está sempre indicada no topo desta página.
          </p>
        </section>

        <section>
          <h2>12. Lei aplicável e foro</h2>
          <p>
            Estes termos são regidos pela lei portuguesa. Para a resolução de qualquer litígio
            emergente da utilização do site ou do sistema, é competente o tribunal português da
            área de residência ou sede do Centro Trindade, sem prejuízo das regras de proteção do
            consumidor que atribuam competência a outro tribunal e sem prejuízo do direito de
            recurso a mecanismos de resolução alternativa de litígios de consumo.
          </p>
        </section>

        <section>
          <h2>13. Contacto</h2>
          <div className="legal-contacto">
            <p>
              Para qualquer questão sobre estes Termos e Condições, contacte-nos através do email{" "}
              <a href="mailto:contato@trindade3oficial.com">contato@trindade3oficial.com</a> ou
              através do <Link to="/formulario">formulário de contacto</Link> do site.
            </p>
          </div>
        </section>

        <Link to="/" className="legal-back">
          <i className="ri-arrow-left-line"></i> Voltar à página inicial
        </Link>

      </div>
    </Layout>
  );
}

export default TermosCondicoes;
