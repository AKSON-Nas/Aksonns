import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, TrendingUp, FileText, DollarSign, PieChart, Calculator } from 'lucide-react';

export default function Guide() {
  const sections = [
    {
      icon: DollarSign,
      title: 'O que é Lucro?',
      color: 'text-green-600',
      content: [
        {
          question: 'Definição de Lucro',
          answer: 'Lucro é a diferença positiva entre as receitas obtidas e os custos/despesas de um negócio. É o ganho financeiro que a empresa realmente tem após pagar todas as suas contas. Fórmula: Lucro = Receitas - (Custos + Despesas)'
        },
        {
          question: 'Tipos de Lucro',
          answer: 'Lucro Bruto: Receita de vendas menos o custo dos produtos vendidos. Lucro Operacional: Lucro bruto menos despesas operacionais (aluguel, salários, marketing). Lucro Líquido: Lucro operacional menos impostos e outras despesas finais. É o "lucro real" que fica para os donos.'
        },
        {
          question: 'Por que o Lucro é Importante?',
          answer: 'O lucro é essencial para: Crescimento do negócio (investir em novos equipamentos, contratar pessoas), Remuneração dos sócios/proprietários, Segurança financeira (reservas para épocas difíceis), Avaliação de desempenho (saber se o negócio está indo bem).'
        }
      ]
    },
    {
      icon: Calculator,
      title: 'Tributos e Impostos',
      color: 'text-blue-600',
      content: [
        {
          question: 'Principais Tributos no Brasil',
          answer: 'Simples Nacional: Regime simplificado que unifica vários impostos em uma única guia. Ideal para pequenas empresas (faturamento até R$ 4,8 milhões/ano). ICMS: Imposto sobre circulação de mercadorias (produtos). ISS: Imposto sobre serviços. PIS/COFINS: Contribuições sociais sobre o faturamento. IRPJ: Imposto de Renda Pessoa Jurídica.'
        },
        {
          question: 'Como Calcular os Impostos?',
          answer: 'No Simples Nacional, a alíquota varia de acordo com a faixa de faturamento e o tipo de atividade (comércio, indústria ou serviços). Exemplo: Uma empresa de comércio que fatura R$ 20.000/mês pode pagar em torno de 4% a 8% de impostos. Use nosso sistema para acompanhar e planejar seus impostos!'
        },
        {
          question: 'Dicas para Pagar Menos Impostos',
          answer: 'Escolha o regime tributário correto (Simples, Lucro Presumido ou Lucro Real). Mantenha sua contabilidade organizada e em dia. Aproveite deduções e benefícios fiscais legais. Consulte um contador especializado para otimizar sua carga tributária.'
        }
      ]
    },
    {
      icon: FileText,
      title: 'DRE - Demonstração do Resultado',
      color: 'text-purple-600',
      content: [
        {
          question: 'O que é DRE?',
          answer: 'A DRE (Demonstração do Resultado do Exercício) é um relatório contábil que mostra se a empresa teve lucro ou prejuízo em um período. Ela organiza todas as receitas e despesas de forma estruturada, facilitando a análise financeira.'
        },
        {
          question: 'Estrutura da DRE',
          answer: 'Receita Bruta de Vendas\n(-) Deduções e Impostos sobre Vendas\n= Receita Líquida\n(-) Custo dos Produtos/Serviços Vendidos\n= Lucro Bruto\n(-) Despesas Operacionais (administrativas, comerciais, financeiras)\n= Lucro Operacional\n(-) Impostos sobre o Lucro\n= Lucro Líquido'
        },
        {
          question: 'Como Usar a DRE?',
          answer: 'A DRE ajuda a: Identificar onde estão os maiores custos, Avaliar a rentabilidade do negócio, Tomar decisões estratégicas (aumentar preços, reduzir despesas, etc.), Apresentar resultados para investidores ou bancos. Faça sua DRE mensalmente para acompanhar a saúde financeira!'
        }
      ]
    },
    {
      icon: PieChart,
      title: 'Gestão de Fluxo de Caixa',
      color: 'text-orange-600',
      content: [
        {
          question: 'O que é Fluxo de Caixa?',
          answer: 'Fluxo de caixa é o movimento de entradas e saídas de dinheiro na empresa. Ele mostra quanto dinheiro você tem disponível a cada momento. Atenção: Lucro não é igual a caixa! Você pode ter lucro no papel, mas não ter dinheiro em caixa para pagar as contas.'
        },
        {
          question: 'Como Gerenciar o Fluxo de Caixa?',
          answer: 'Registre todas as entradas (vendas à vista, recebimentos). Registre todas as saídas (pagamentos de fornecedores, salários, aluguel). Planeje o futuro: projete entradas e saídas dos próximos dias/semanas. Mantenha uma reserva de emergência (capital de giro). Negocie prazos: tente receber mais rápido e pagar mais tarde (sem atrasar obrigações).'
        },
        {
          question: 'Sinais de Alerta',
          answer: 'Fique atento se: O caixa está frequentemente negativo. Você precisa usar dinheiro pessoal para pagar contas da empresa. Há muitas vendas a prazo e poucos recebimentos. Use nosso sistema para acompanhar seu fluxo de caixa diariamente!'
        }
      ]
    },
    {
      icon: TrendingUp,
      title: 'Indicadores de Desempenho',
      color: 'text-pink-600',
      content: [
        {
          question: 'Margem de Lucro',
          answer: 'Indica quanto da receita se transforma em lucro. Fórmula: (Lucro Líquido / Receita Total) x 100. Exemplo: Se sua receita é R$ 10.000 e o lucro é R$ 2.000, sua margem é 20%. Quanto maior, melhor!'
        },
        {
          question: 'Ticket Médio',
          answer: 'Valor médio de cada venda. Fórmula: Receita Total / Número de Vendas. Aumentar o ticket médio é uma estratégia para crescer sem precisar aumentar muito o número de clientes.'
        },
        {
          question: 'ROI - Retorno sobre Investimento',
          answer: 'Mede o retorno de um investimento. Fórmula: (Ganho - Custo do Investimento) / Custo do Investimento x 100. Exemplo: Investiu R$ 1.000 em marketing e ganhou R$ 3.000? ROI = 200%! Use para avaliar se vale a pena investir em novos projetos.'
        }
      ]
    },
    {
      icon: BookOpen,
      title: 'Boas Práticas de Gestão',
      color: 'text-indigo-600',
      content: [
        {
          question: 'Separe Finanças Pessoais e Empresariais',
          answer: 'Nunca misture o dinheiro da empresa com o pessoal. Tenha contas bancárias separadas. Defina um pró-labore (salário fixo) para você como sócio/proprietário. Isso facilita a gestão e evita problemas.'
        },
        {
          question: 'Invista em Tecnologia',
          answer: 'Use sistemas de gestão como o nosso para: Automatizar tarefas repetitivas, Ter dados em tempo real, Reduzir erros humanos, Tomar decisões baseadas em dados, não em "achismos". A tecnologia é sua aliada para crescer!'
        },
        {
          question: 'Capacitação Contínua',
          answer: 'Estude sempre sobre gestão, marketing, finanças. Participe de cursos, workshops e mentorias. Conheça seu mercado e concorrentes. Aprenda com seus erros e acertos. O conhecimento é o melhor investimento!'
        }
      ]
    }
  ];

  return (
    <div className="animate-fade-in" data-testid="guide-page">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <BookOpen className="h-10 w-10 text-orange-600 mr-4" />
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Guia Financeiro
          </h1>
        </div>
        <p className="text-gray-600 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
          Aprenda tudo sobre gestão empresarial, lucro, tributos e muito mais!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300" data-testid={`guide-section-${index}`}>
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center">
                  <div className={`h-12 w-12 rounded-lg bg-white shadow-md flex items-center justify-center mr-4`}>
                    <Icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <CardTitle className="text-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {section.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {section.content.map((item, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} data-testid={`accordion-item-${index}-${idx}`}>
                      <AccordionTrigger className="text-left font-semibold hover:text-blue-600">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="pt-6 text-center">
          <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Quer colocar isso em prática?
          </h3>
          <p className="text-gray-700 mb-4">
            Faça upgrade para Premium e use nossas ferramentas de Orçamentos, Estoque e Vendas!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}