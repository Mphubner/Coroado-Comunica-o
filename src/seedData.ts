export interface InitialTheme {
  title: string;
  description: string;
  order: number;
  lessons: {
    title: string;
    order: number;
    objective: string;
    bibleReferences: string;
    openingQuestion: string;
    summary: string;
    youtubeUrl: string;
    driveDocUrl: string;
    driveSlideUrl: string;
    devotional: {
      title: string;
      bibleReference: string;
      readingInstruction: string;
      guidedMeditation: string;
      suggestedPrayer: string;
      weeklyPractice: string;
    };
  }[];
}

export const seedThemesAndLessons: InitialTheme[] = [
  {
    "title": "Tema 1 - Formação Espiritual",
    "description": "Os fundamentos do coração do servo da comunicação. Todo trabalho externo do ministério flui da saúde espiritual mantida no secreto com o Pai.",
    "order": 1,
    "lessons": [
      {
        "title": "Aula 01 - Identidade e Chamado",
        "order": 1,
        "objective": "Levar o novo servo a entender que chamado vem antes de competência e que o dom recebido é administração da graça, não propriedade pessoal.",
        "bibleReferences": "Efésios 1:4-11; Jeremias 1:5; 1 Pedro 4:10; Salmo 139:13-16",
        "openingQuestion": "Quem sou eu diante de Deus antes de qualquer função que eu exerço?",
        "summary": "A vida cristã não começa com uma escala, uma função ou uma habilidade. Ela começa com Deus chamando pessoas pelo nome. Em Efésios 1, Paulo mostra que nossa identidade nasce em Cristo antes da nossa performance. Isso confronta duas mentiras comuns no serviço: a mentira de que estamos aqui por acaso e a mentira de que estamos aqui porque somos indispensáveis.\n\nQuando Jeremias é chamado, Deus não começa perguntando se ele se sente pronto. Deus começa afirmando que o conhece. Isso é profundamente libertador para quem chega em um ministério com medo de errar, de não saber o suficiente ou de ser comparado com pessoas mais experientes. O chamado não nasce da autoconfiança; nasce da iniciativa de Deus. Ao mesmo tempo, chamado não elimina formação. Deus chama e, depois, forma.\n\n1 Pedro 4:10 dá o vocabulário correto para o dom: administração. Administrar é diferente de possuir. O designer não é dono do olhar. O fotógrafo não é dono da sensibilidade. Quem escreve não é dono da palavra. Quem edita não é dono da narrativa. Tudo foi recebido para servir o corpo. O ego pergunta: como isso me destaca? A mordomia pergunta: como isso edifica a igreja e aponta para Cristo?\n\nEsse ponto é decisivo para novos integrantes porque todo ministério testa identidade. Quando a entrega é elogiada, o coração pode se inflar. Quando a entrega é corrigida, o coração pode se defender. Quando ninguém vê, o coração pode desanimar. Só uma identidade firmada em Cristo suporta elogio, correção e anonimato sem perder o eixo.\n\nA Coroado precisa de servos que entendam que a função é importante, mas não é a fonte do valor. Você não serve para provar que tem valor. Você serve porque recebeu graça. E se recebeu graça, serve com alegria, humildade e responsabilidade.",
        "youtubeUrl": "https://www.youtube.com/watch?v=7HC8lPB36OQ",
        "driveDocUrl": "https://docs.google.com/document/d/1-WZNRNgwxUGH_0cIoMrEaZnUqQDzufsP",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1B4ZZFiEQGW6pMLwJGiDH42WC247SRqfh",
        "devotional": {
          "title": "Devocional 01 - Identidade e Chamado",
          "bibleReference": "Efésios 1:4-11",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, algo que chame sua  atenção e uma resposta de obediência.",
          "guidedMeditation": "Leia 1 Pedro 4:10 na NVI com calma.\n\nO texto coloca três verdades na mesa: você recebeu algo, esse algo deve ser administrado e a finalidade é servir aos outros.\n\nHoje, antes de pensar em escala, cargo ou como serão as entregas do ministério, ore sobre posse. Pergunte ao Senhor onde você tem tratado os seus dons como se fosse seu. Às vezes isso aparece em vaidade; às vezes aparece em medo. A vaidade diz: isso me torna especial. O medo diz: se eu falhar, eu perco meu valor. O evangelho responde aos dois: seu valor está em Cristo, e seu dom existe para amar o corpo.\n\nFique alguns minutos em silêncio e nomeie diante de Deus uma habilidade que você reconhece em si. Depois entregue essa habilidade de volta a Ele. Peça que o Senhor purifique sua motivação, fortaleça sua responsabilidade e te dê alegria de servir mesmo quando ninguém aplaude.",
          "suggestedPrayer": "Senhor, isso não é meu. Eu recebi. Ensina-me a administrar com fidelidade, humildade e alegria. Que esse dom não construa meu nome, mas sirva o Teu corpo.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas."
        }
      },
      {
        "title": "Aula 02 - Grande Comissão e Comunicação",
        "order": 2,
        "objective": "Mostrar que comunicação não é enfeite da igreja. É estrada para discipulado, acolhimento, evangelização e testemunho público.",
        "bibleReferences": "Mateus 28:18-20; Romanos 10:14-15; Atos 2:42-47; 1 Coríntios 9:22-23",
        "openingQuestion": "Por que comunicação pode ser uma forma real de obedecer à Grande Comissão?",
        "summary": "Jesus não entregou a Grande Comissão para uma elite religiosa. Ele falou com discípulos. Fazer discípulos envolve ir, anunciar, ensinar e acompanhar. Hoje, parte desse caminho passa por telas, mensagens, vídeos, testemunhos, convites, transmissões e respostas humanas. Isso não substitui culto, célula, pastoreio ou presença. Mas pode ser a primeira porta pela qual alguém se aproxima.\n\nRomanos 10 pergunta como as pessoas ouvirão se ninguém anunciar. Comunicação remove distância. Uma legenda clara, um corte fiel de pregação, um convite simples, uma resposta no direct, uma arte bem pensada e uma transmissão bem cuidada podem servir para que alguém ouça aquilo que ainda não tinha ouvido de forma compreensível.\n\nO Manifesto da Comunicação da Coroado acerta ao separar mensagem e formato. A mensagem é trilho. O formato é trem. A igreja não muda o Evangelho para agradar a cultura, mas adapta linguagem, canal e ritmo para que a mensagem seja ouvida. Paulo fez isso sem adulterar o conteúdo. Ele se aproximava das pessoas sem negociar a verdade.\n\nPor isso, comunicação cristã não é só estética. Estética pode atrair, mas não pode governar. O centro é fidelidade. Uma comunicação bonita, mas vazia, cria vitrine. Uma comunicação fiel, clara e humana, cria ponte. A pergunta principal não é: isso está bonito? A pergunta principal é: isso ajuda alguém a entender, responder e caminhar?\n\nO novo integrante precisa enxergar sua entrega como parte da missão. Quem comunica na igreja trabalha com atenção, linguagem e confiança. Essas coisas são sérias. A comunicação pode abrir caminho para uma pessoa visitar a igreja, entrar em uma célula, pedir oração, entender uma pregação e dar o próximo passo no discipulado.",
        "youtubeUrl": "https://www.youtube.com/watch?v=pIy82P1_3e4",
        "driveDocUrl": "https://docs.google.com/document/d/1mhTytr38aRcJ64MPLp14P7eMI1uxjFkq",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1D98UJ8Us0BtgIxKxg366iK01hCqOtTYI",
        "devotional": {
          "title": "Devocional 02 - Grande Comissão e Comunicação",
          "bibleReference": "Mateus 28:18-20",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, algo que chame atenção e uma resposta de obediência.",
          "guidedMeditation": "Leia Romanos 10:14-15 na NVI. Observe a lógica do texto: ouvir, crer, invocar e anunciar caminham juntos. Deus usa pessoas para que outras pessoas ouçam. Isso coloca peso espiritual em coisas que às vezes tratamos como simples detalhe.\n\nPense em alguém que talvez nunca tenha entrado em uma igreja por convite formal, mas poderia ser tocado por uma mensagem clara, verdadeira e humana. Não transforme essa pessoa em público-alvo frio. Ore por ela como gente real. Peça que Deus dê à Coroado uma comunicação que não manipule, não performe e não confunda, mas abra caminho.\n\nHoje, entregue sua linguagem ao Senhor. O que você escreve, grava, edita, responde ou publica pode ser ponte. Mas a ponte não existe para aparecer, o objetivo da ponte existir é para que as pessoas atravessem. Peça a Deus que sua comunicação carregue verdade, clareza e amor.",
          "suggestedPrayer": "Senhor, usa minha voz, meu trabalho e minha presença digital como ponte, e não apenas como vitrine. Que a mensagem seja fiel, que o formato sirva, e que pessoas encontrem caminho para Cristo.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      },
      {
        "title": "Aula 03 - Vida Espiritual do Servo Criativo",
        "order": 3,
        "objective": "Ensinar que criatividade precisa nascer de permanência em Cristo, descanso obediente e ferramenta afiada.",
        "bibleReferences": "João 15:1-5; Salmo 127:1-2; Eclesiastes 10:10; Marcos 1:35",
        "openingQuestion": "Como servir de forma criativa sem virar uma pessoa espiritualmente vazia?",
        "summary": "Jesus é direto em João 15: sem permanência, não há fruto verdadeiro. O problema é que, no ministério, é possível continuar produzindo por um tempo mesmo quando o coração já parou de permanecer. Post sai. Vídeo sai. Arte sai. Texto sai. Mas a alma vai ficando seca. E um servo seco pode até entregar conteúdo, mas perde peso espiritual.\n\nA videira não trabalha por ansiedade. O ramo frutifica porque permanece. Isso reorganiza a vida do servo criativo. A pergunta não é apenas: quanto eu consigo produzir? A pergunta é: de onde está vindo o que eu produzo? Se a fonte é comparação, pressa, necessidade de validação ou medo de decepcionar, o serviço fica pesado e instável.\n\nSalmo 127 confronta o ativismo religioso. Se Deus não edifica, o trabalho se torna vão. O mesmo salmo fala de descanso. Descanso não é preguiça espiritual; é confissão prática de que Deus continua sendo Deus quando você para. O servo que nunca para nem sempre é mais fiel. Às vezes é alguém tentando carregar com as mãos aquilo que deveria confiar ao Senhor.\n\nEclesiastes 10:10 fala da ferramenta afiada. Afiar o machado é se preparar: Bíblia, oração, estudo, referência, técnica, feedback e descanso. Não é menos espiritual estudar ferramenta. Mas ferramenta afiada precisa estar na mão de um coração rendido. Técnica sem presença vira performance. Presença sem preparo pode virar improviso irresponsável.\n\nA Coroado precisa formar servos criativos com raiz e ritmo. Raiz é vida secreta com Deus. Ritmo é aprender a servir sem destruir a alma. Isso inclui pedir ajuda, receber feedback, planejar melhor, descansar com consciência limpa e cultivar uma rotina devocional possível.",
        "youtubeUrl": "https://www.youtube.com/watch?v=3rzhBrWK4uQ",
        "driveDocUrl": "https://docs.google.com/document/d/1jZdAsInGiqb2iHce-14_m-Bfafy9mb6w",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1hOXK9EjifDM07Nj4CNfu8xMEjxPk3rKK",
        "devotional": {
          "title": "Devocional 03 - Vida Espiritual do Servo Criativo",
          "bibleReference": "João 15:1-5",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, algo que chame  atenção e uma resposta de obediência.",
          "guidedMeditation": "Leia João 15:1-5 na NVI. Não corra para a parte do fruto. Fique primeiro na palavra permanecer. Jesus não chama você apenas para produzir para Ele, mas para permanecer nEle. O fruto que Deus deseja nasce dessa união.\n\nHoje, antes de pedir produtividade, peça permanência. Diga a Jesus onde você tem tentado produzir sem se alimentar. Nomeie sua pressa, sua ansiedade de performar e sua necessidade de ser visto. O Senhor não está impressionado com atividade que rouba intimidade.\n\nDepois, leia Salmo 127:1-2. Receba o descanso como ato de fé. Talvez sua prática espiritual hoje seja parar, respirar, desligar uma cobrança interna e lembrar que a igreja pertence a Jesus. Você participa da obra, mas não é o dono da obra.",
          "suggestedPrayer": "Jesus, eu não quero entregar conteúdo com o coração vazio. Ensina-me a permanecer, descansar e me preparar com humildade. Que minha criatividade venha da Tua presença.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas."
        }
      }
    ]
  },
  {
    "title": "Tema 2 - Cultura e Pertencimento",
    "description": "Nossa visão local, o DNA da Coroado e como nos encaixamos no modelo de igreja em células.",
    "order": 2,
    "lessons": [
      {
        "title": "Aula 01 - Visão da Coroado e Igreja em Células",
        "order": 1,
        "objective": "Conectar o novo servo à visão de igreja em células, discipulado, relacionamento e multiplicação.",
        "bibleReferences": "Atos 2:42-47; Atos 17:6; Provérbios 29:18; Efésios 4:15-16",
        "openingQuestion": "Que tipo de igreja a Coroado está formando, e como a comunicação serve essa visão?",
        "summary": "Atos 2 mostra uma igreja que aprendia, orava, partia o pão, compartilhava vida e crescia de forma orgânica. A igreja não era apenas evento. Era vida compartilhada. A visão celular da Coroado conversa com isso: culto e célula, celebração e casa, Palavra e mesa, multidão e cuidado próximo.\n\nUma igreja em células não comunica apenas agenda. Comunica caminho. A pessoa precisa entender como sair do culto para a célula, da célula para o discipulado, do discipulado para o serviço, do serviço para a maturidade. Comunicação serve quando torna esse caminho claro, acessível e praticável.\n\nO Dia da Visão reforça uma frase importante: cada membro é ministro chamado e capacitado por Deus. Isso tira a igreja do modo espectador. O novo integrante não entra para assistir uma estrutura funcionando. Ele entra para ser parte viva do corpo. Na prática, isso muda a postura: a pergunta deixa de ser o que a igreja me oferece e passa a ser como posso participar do que Deus está fazendo aqui.\n\nEfésios 4 mostra um corpo que cresce quando cada parte realiza sua função. A visão não depende apenas de grandes momentos, mas de cada junta cooperando. Comunicação, recepção, célula, louvor, crianças, intercessão e cuidado pastoral não são ilhas. São partes de um corpo.\n\nPor isso, quem entra no ministério precisa amar mais a visão do que a própria preferência. Às vezes a entrega que eu mais gosto não é a mais necessária. Às vezes o formato que eu prefiro não é o que mais ajuda as pessoas. Pertencer é aprender a servir a visão, não apenas expressar gosto pessoal.",
        "youtubeUrl": "https://www.youtube.com/watch?v=zOnfCOv6lU8",
        "driveDocUrl": "https://docs.google.com/document/d/1fuMoUOAxHvZO0ODHd1yJ1DmnCjPeI1-V",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1L0GjOJ62Ic6zXurJrk0rvH2h0o1Rr36J",
        "devotional": {
          "title": "Devocional 01 - Visão da Coroado e Igreja em Células",
          "bibleReference": "Atos 2:42-47",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, uma tensão e uma resposta de obediência.",
          "guidedMeditation": "Leia Atos 2:42-47 na NVI. Observe que a igreja aparece como comunidade viva, não como evento isolado. Havia ensino, comunhão, oração, generosidade, mesa, presença e testemunho. O resultado era crescimento que Deus sustentava.\n\nHoje, ore para não ser apenas frequentador de ambiente, mas parte do corpo. Pergunte ao Senhor onde você ainda consome mais do que participa. A cultura da Coroado não é chamar pessoas para uma plateia maior, mas formar discípulos em relacionamento.\n\nPense em alguém novo que ainda não encontrou caminho de pertencimento. Ore por essa pessoa e peça a Deus sensibilidade para enxergá-la. Às vezes, uma mensagem respondida com cuidado, um convite para célula ou uma explicação simples abre uma porta importante.",
          "suggestedPrayer": "Senhor, dá-me amor pela Tua igreja. Que eu não sirva apenas uma área, mas participe de uma visão. Usa minha vida para ajudar pessoas a encontrarem lugar, cuidado e discipulado.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      },
      {
        "title": "Aula 02 - Cultura de Servo",
        "order": 2,
        "objective": "Formar uma mentalidade de servo: humilde, comprometida, ensinável e sem elitismo espiritual ou técnico.",
        "bibleReferences": "Marcos 10:42-45; João 13:1-17; Filipenses 2:3-8; Colossenses 3:23",
        "openingQuestion": "Qual é a diferença entre ajudar quando dá e servir porque recebeu uma responsabilidade diante de Deus?",
        "summary": "Jesus redefine grandeza. No Reino, grande não é quem domina, aparece ou controla. Grande é quem serve. Isso confronta diretamente a cultura de performance, onde valor parece depender de visibilidade, influência e reconhecimento. O servo de Jesus aprende outro caminho: descer para amar.\n\nJoão 13 é uma das cenas mais fortes para qualquer ministério. Jesus, sabendo quem era, lavou pés. Ele não serviu por insegurança. Serviu a partir de identidade. Isso é importante: gente insegura usa ministério para se provar; gente firmada em Cristo consegue pegar a toalha sem se sentir diminuída.\n\nNa comunicação da igreja, a cultura de servo aparece em detalhes simples: chegar no horário, responder com clareza, revisar antes de entregar, pedir ajuda, não desprezar tarefas invisíveis, aceitar correção e celebrar o trabalho dos outros. Espiritualidade que não chega ao comportamento vira discurso.\n\nFilipenses 2 mostra que humildade não é baixa autoestima. Humildade é considerar o outro. É usar liberdade para amar. É abrir mão de direitos quando o amor pede. Em uma equipe, isso significa não transformar preferência pessoal em guerra, não usar talento como moeda de poder e não tratar voluntariado como favor feito a Deus.\n\nA frase precisa ficar clara: você não serve à Coroado como quem presta um favor. Você serve a Deus através da Coroado. Isso dá peso, mas também dá alegria. O serviço deixa de ser obrigação seca e vira resposta de amor.",
        "youtubeUrl": "https://www.youtube.com/watch?v=zOnfCOv6lU8",
        "driveDocUrl": "https://docs.google.com/document/d/1uftFjPsoOLa2s1dRWHrwUrFVSXvqCCW1",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1Ow4Qf4pmkHbu09fx_ojd-HWQ5AnR-Gpw",
        "devotional": {
          "title": "Devocional 02 - Cultura de Servo",
          "bibleReference": "Marcos 10:42-45",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, uma tensão e uma resposta de obediência.",
          "guidedMeditation": "Leia João 13:1-17 na NVI. Veja Jesus lavando pés com plena consciência de quem era. Ele não precisava provar nada. Justamente por saber quem era, pôde se abaixar.\n\nPeça ao Espírito Santo que mostre onde você tem resistido à toalha. Talvez você aceite servir quando há visibilidade, mas se incomode com tarefas pequenas. Talvez você faça, mas por dentro cobre reconhecimento. O Senhor não quer apenas sua entrega; quer formar seu coração.\n\nHoje, pratique um serviço escondido. Não anuncie. Não use isso como moeda espiritual. Apenas sirva. Deixe que Deus veja. Existe liberdade profunda quando o coração aprende que ser visto por Deus basta.",
          "suggestedPrayer": "Jesus, tira de mim a necessidade de parecer importante. Forma em mim a alegria de servir como Tu serviste. Que minha presença alivie cargas, não aumente pesos.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      },
      {
        "title": "Aula 03 - Unidade, Mentoria e Processos",
        "order": 3,
        "objective": "Mostrar que ordem não é burocracia fria; é cuidado com pessoas, mensagem e continuidade.",
        "bibleReferences": "Efésios 4:1-16; Mateus 18:15-17; Provérbios 11:14; 2 Timóteo 2:2",
        "openingQuestion": "Por que processos, feedback e mentoria também são formas de proteger a unidade?",
        "summary": "Efésios 4 mostra que unidade não é automática. Paulo manda preservar a unidade do Espírito. Isso significa que unidade precisa ser guardada. Em uma equipe criativa, unidade é testada por preferências, urgências, ruídos de comunicação, correções, prazos e expectativas não ditas.\n\nProcessos existem para proteger pessoas. Quando não há clareza, tudo vira pessoal. Atraso vira suspeita. Feedback vira ataque. Revisão vira controle. Briefing vira detalhe opcional. Mas quando existe fluxo claro, a equipe respira melhor. Processo saudável reduz ruído e cria confiança.\n\nMateus 18 ensina um caminho de tratamento de conflito. O objetivo não é vencer discussão, mas ganhar o irmão. Isso precisa entrar na cultura da equipe. Se algo incomodou, converse com a pessoa certa, no tom certo, no tempo certo. Não transforme bastidor em comentário solto. Não faça da frustração uma roda paralela.\n\nMentoria também protege unidade porque transmite cultura. Paulo orienta Timóteo a confiar a pessoas fiéis aquilo que recebeu. Isso é mais do que treinamento técnico; é continuidade espiritual. Uma equipe saudável não depende apenas de talentos isolados. Ela forma pessoas que conseguem carregar a visão adiante.\n\nNa prática, unidade e processo caminham juntos. O servo aprende a perguntar antes de agir, avisar quando não consegue entregar, receber correção, registrar informações e honrar combinados. Isso parece operacional, mas é profundamente espiritual: fidelidade no pequeno constrói confiança no corpo.",
        "youtubeUrl": "https://www.youtube.com/watch?v=zOnfCOv6lU8",
        "driveDocUrl": "https://docs.google.com/document/d/1urQlW49WesvtyYE910w2UFKpck59DURn",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1KXsbgmKBT5pBwczhjGWu5MTeT57DoYtm",
        "devotional": {
          "title": "Devocional 03 - Unidade, Mentoria e Processos",
          "bibleReference": "Efésios 4:1-16",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, uma tensão e uma resposta de obediência.",
          "guidedMeditation": "Leia Efésios 4:1-6 na NVI. Paulo liga vocação a humildade, mansidão, paciência e amor. Unidade não é só concordar em uma reunião; é caminhar de modo digno quando aparecem diferenças reais.\n\nOre hoje por sua postura dentro da equipe. Pergunte ao Senhor se você tem sido alguém que pacifica ou alguém que aumenta ruído. Às vezes a falta de processo revela falta de amor, porque obriga outras pessoas a carregarem confusão que poderia ter sido evitada.\n\nPeça humildade para ser mentorado. Quem não aceita orientação fica limitado à própria visão. Deus usa pessoas para nos formar, corrigir, proteger e enviar. Receber mentoria não diminui seu chamado; sustenta seu chamado.",
          "suggestedPrayer": "Senhor, faz de mim alguém que guarda unidade. Ensina-me a falar com clareza, ouvir correção, honrar processos e resolver conflitos de modo digno do Evangelho.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      }
    ]
  },
  {
    "title": "Tema 3 - Mordomia e Excelência",
    "description": "Como lidamos com os talentos recebidos, o uso do tempo e a busca contínua pela excelência.",
    "order": 3,
    "lessons": [
      {
        "title": "Aula 01 - O Dom é Emprestado",
        "order": 1,
        "objective": "Confrontar passividade, vaidade e medo, mostrando que dom foi dado para multiplicação e edificação.",
        "bibleReferences": "Mateus 25:14-30; 1 Pedro 4:10-11; Romanos 12:3-8; 1 Coríntios 4:1-2",
        "openingQuestion": "O que muda quando entendo que meu dom é recebido, não possuído?",
        "summary": "A parábola dos talentos confronta uma falsa humildade muito comum. O problema do servo infiel não foi perder dinheiro. Foi enterrar o que recebeu. Ele tratou o medo como justificativa para não administrar. Isso fala diretamente com dons espirituais, habilidades técnicas e oportunidades de serviço.\n\nDom enterrado não é humildade. É desperdício. Às vezes alguém diz que não quer aparecer, mas no fundo está se escondendo da responsabilidade de crescer. Outras vezes, alguém usa o dom para aparecer, e o problema é vaidade. O Evangelho confronta os dois extremos: nem vaidade, nem omissão; fidelidade.\n\n1 Pedro 4 coloca o dom dentro da graça. O dom não é troféu pessoal, é expressão da multiforme graça de Deus. Isso significa que quando você serve bem, outras pessoas recebem graça através do que Deus confiou a você. Um texto claro, uma foto sensível, uma edição fiel, uma transmissão estável e uma resposta pastoral podem ser meios de cuidado.\n\nRomanos 12 ensina sobriedade. Ninguém deve pensar de si além do que convém, mas também ninguém deve desprezar o que recebeu. Maturidade é olhar para o dom sem inflar e sem enterrar. É reconhecer: Deus me confiou algo, e eu preciso desenvolver com responsabilidade.\n\nA pergunta de mordomia não é: qual é o tamanho do meu dom comparado ao do outro? A pergunta é: tenho sido fiel com o que recebi? Deus não chama todos para a mesma medida, mas chama todos para fidelidade.",
        "youtubeUrl": "https://www.youtube.com/watch?v=zOnfCOv6lU8",
        "driveDocUrl": "https://docs.google.com/document/d/1zbNgqAIp2WlgB9IvSj7AYUiBOhraveCl",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1JQWXl4a8O17pOkDpPkpMB1sWx1AW6UUs",
        "devotional": {
          "title": "Devocional 01 - O Dom é Emprestado",
          "bibleReference": "Mateus 25:14-30",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, uma tensão e uma resposta de obediência.",
          "guidedMeditation": "Leia Mateus 25:14-30 na NVI. Observe que a fidelidade não é medida apenas pelo que foi recebido, mas pela forma como cada servo administra o que recebeu. Deus não elogia comparação; elogia fidelidade.\n\nHoje, coloque diante do Senhor um dom que você tem enterrado por medo, vergonha, preguiça ou comparação. Seja honesto. O medo costuma vestir roupa de prudência, mas nem sempre é prudência. Às vezes é desobediência com linguagem bonita.\n\nPeça ao Senhor uma coragem humilde: coragem para desenvolver o que recebeu e humildade para lembrar que tudo pertence a Ele. Crescer em técnica, estudar, treinar e pedir feedback não é vaidade quando o objetivo é servir melhor.",
          "suggestedPrayer": "Senhor, não quero enterrar o que me confiaste. Livra-me da vaidade e da omissão. Forma em mim fidelidade para multiplicar graça no Teu corpo.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      },
      {
        "title": "Aula 02 - Tempo, Atenção e Influência",
        "order": 2,
        "objective": "Expandir mordomia para além do talento: tempo, atenção das pessoas, influência digital e testemunho público.",
        "bibleReferences": "Efésios 5:15-17; Colossenses 4:5-6; Tiago 3:1-12; Provérbios 4:23",
        "openingQuestion": "Como administrar aquilo que não aparece: agenda, foco, palavra e influência?",
        "summary": "Mordomia não envolve apenas dom. Envolve tempo. Efésios 5 chama a viver com sabedoria, aproveitando bem as oportunidades. No ministério, isso aparece em pontualidade, preparo, antecedência e comunicação clara. Atrasos constantes e improvisos desnecessários também discipulam uma cultura, só que para o lugar errado.\n\nAtenção também é mordomia. Quando a igreja publica algo, pede atenção das pessoas. Quando uma legenda é longa, quando um vídeo ocupa minutos, quando uma transmissão entra na casa de alguém, estamos administrando atenção. Isso precisa ser feito com respeito. A pergunta é: isso honra o tempo de quem vai receber? Está claro? Está fiel à mensagem?\n\nInfluência digital é outra camada. O servo não deixa de representar Cristo quando sai do perfil oficial. Tiago mostra que palavras têm poder. Uma pessoa pode servir bem na escala e destruir testemunho no comentário, no story, na ironia ou na exposição irresponsável. O coração precisa guardar a boca e os dedos.\n\nProvérbios 4 fala sobre guardar o coração, porque dele procedem as fontes da vida. Antes de uma crise pública, quase sempre houve descuido secreto. Quem serve com comunicação precisa vigiar consumo, comparação, cinismo, vaidade e necessidade de aprovação. O que alimenta o coração aparece no tom.\n\nMordomia de tempo, atenção e influência pede maturidade. Nem tudo que posso dizer devo dizer. Nem tudo que chama atenção edifica. Nem toda pressa é obediência. O servo maduro aprende a perguntar: isso serve à missão, honra pessoas e aponta para Cristo?",
        "youtubeUrl": "https://www.youtube.com/watch?v=zOnfCOv6lU8",
        "driveDocUrl": "https://docs.google.com/document/d/1d3-_xS7zCxFrrbyISgZQ3JLeRJw8TvEh",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1o8ZHmIVI7cYsHgvj5Br1BYBjJe7Mdh5e",
        "devotional": {
          "title": "Devocional 02 - Tempo, Atenção e Influência",
          "bibleReference": "Efésios 5:15-17",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, uma tensão e uma resposta de obediência.",
          "guidedMeditation": "Leia Efésios 5:15-17 na NVI. Paulo chama a viver com cuidado, não de qualquer jeito. Isso parece simples, mas é profundamente espiritual. Deus se importa com a forma como administramos dias, horários, palavras e oportunidades.\n\nHoje, ore sobre sua agenda. Não apenas para ter mais tempo, mas para ter mais sabedoria. Pergunte ao Senhor onde você tem desperdiçado atenção com coisas que não formam Cristo em você. Pergunte também onde sua desorganização tem pesado sobre outras pessoas.\n\nDepois, ore sobre sua influência. Peça que Deus alinhe o que você publica, comenta, curte, compartilha e responde com o caráter de Cristo. Não existe espiritualidade desconectada da palavra.",
          "suggestedPrayer": "Senhor, ensina-me a administrar tempo, atenção e influência. Que minhas palavras tenham graça, minha agenda revele sabedoria e minha presença pública não contradiga o Teu nome.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      },
      {
        "title": "Aula 03 - Excelência, Preparo e Descanso",
        "order": 3,
        "objective": "Equilibrar excelência, preparo, limites e descanso como atos de adoração e mordomia.",
        "bibleReferences": "Colossenses 3:23-24; Êxodo 31:1-6; Salmo 127:1-2; Marcos 6:31",
        "openingQuestion": "Como buscar excelência sem cair em perfeccionismo, ansiedade ou ativismo?",
        "summary": "Colossenses 3 ensina que trabalhamos como para o Senhor. Isso elimina entrega relaxada, mas também elimina performance para aprovação humana. Excelência cristã não é obsessão por controle; é fidelidade no que Deus confiou. Ela pergunta: fiz o melhor possível, com os recursos e o tempo que tinha, de modo fiel à missão?\n\nÊxodo 31 mostra Deus enchendo pessoas com habilidade artística para construir o tabernáculo. Isso dignifica técnica. Deus se importa com forma, beleza, detalhe e preparo. Arte, design, edição, música, organização e tecnologia podem ser instrumentos de adoração quando servem ao propósito de Deus.\n\nMas excelência não é perfeccionismo. Perfeccionismo paralisa porque quer controle absoluto e medo zero. Excelência avança com cuidado, revisão, preparo e humildade para melhorar. Perfeccionismo coloca o ego no centro: e se me criticarem? Excelência coloca Deus e o próximo no centro: como posso servir melhor?\n\nSalmo 127 e Marcos 6 lembram que descanso também é espiritual. Jesus chamou os discípulos para descansar. Isso confronta a ideia de que servo fiel é aquele que nunca para. Descanso não é fuga do chamado; é parte da mordomia do corpo e da alma. Quem despreza limites pode até produzir muito por um tempo, mas cobra caro depois.\n\nNa Coroado, excelência precisa caminhar com saúde. Revisar é bom. Planejar é bom. Treinar é bom. Mas também é bom comunicar limites, pedir ajuda, evitar urgências desnecessárias e construir ritmo sustentável. Deus não nos chama para queimar por vaidade religiosa, mas para frutificar com fidelidade.",
        "youtubeUrl": "https://www.youtube.com/watch?v=zOnfCOv6lU8",
        "driveDocUrl": "https://docs.google.com/document/d/1sBatzsL70M83kDJJAJP7T9Zq_WnuTn_1",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1LKlzahYTe0oeTzHR-WK0v4awdjvMIKuH",
        "devotional": {
          "title": "Devocional 03 - Excelência, Preparo e Descanso",
          "bibleReference": "Colossenses 3:23-24",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, uma tensão e uma resposta de obediência.",
          "guidedMeditation": "Leia Colossenses 3:23-24 na NVI. Trabalhar para o Senhor não significa viver esmagado por cobrança. Significa tirar o centro dos olhos humanos e colocar o serviço diante de Deus.\n\nHoje, entregue ao Senhor a tensão entre zelo e ansiedade. Peça discernimento para perceber quando você está buscando excelência por amor e quando está buscando perfeição por medo. Deus não precisa da sua ansiedade para ser glorificado.\n\nLeia também Marcos 6:31. Receba o convite de Jesus ao descanso. O descanso pode ser obediência. Pode ser humildade. Pode ser a forma de lembrar que você é filho antes de ser servo.",
          "suggestedPrayer": "Senhor, ensina-me a servir com zelo e descansar com fé. Que minha excelência seja adoração, não vaidade; que meu descanso seja confiança, não fuga.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      }
    ]
  },
  {
    "title": "Tema 4 - Mensagem, Formato e Prática",
    "description": "Como estruturar a mensagem da igreja para que ela chegue de forma compreensível e excelente ao destinatário final.",
    "order": 4,
    "lessons": [
      {
        "title": "Aula 01 - Palavra, Púlpito e Comunicação",
        "order": 1,
        "objective": "Ensinar que comunicação da igreja deve preservar a mensagem, explicar com clareza e evitar distorção por estética ou pressa.",
        "bibleReferences": "2 Timóteo 4:1-5; Neemias 8:1-12; 1 Coríntios 2:1-5; Salmo 119:105",
        "openingQuestion": "Como transformar o que foi pregado em comunicação fiel, clara e acessível?",
        "summary": "2 Timóteo 4 coloca a Palavra no centro do ministério. Paulo não manda Timóteo entreter pessoas, mas pregar a Palavra. Isso precisa governar a comunicação da igreja. A comunicação não cria uma mensagem paralela para parecer atual. Ela serve a mensagem que Deus confiou à igreja.\n\nNeemias 8 mostra o povo ouvindo a Lei e recebendo explicação clara. Havia leitura e havia sentido. Comunicação fiel também faz isso: ajuda pessoas a entenderem. Um corte de pregação precisa preservar contexto. Uma legenda precisa evitar frase solta que distorce. Uma arte com versículo precisa respeitar o texto, não usar a Bíblia como decoração.\n\n1 Coríntios 2 confronta dependência de brilho humano. Paulo não despreza clareza, mas recusa uma comunicação sustentada apenas por técnica persuasiva. Isso é importante para a Coroado: podemos usar boa escrita, design, vídeo e estratégia, mas não confiamos nessas coisas como poder final. O poder pertence a Deus.\n\nA frase do Manifesto continua sendo régua: a mensagem é trilho; o formato é trem. O trem pode mudar: post, vídeo, story, transmissão, carrossel, direct, roteiro. O trilho não muda. Quando formato governa mensagem, descarrila. Quando mensagem governa formato, a criatividade ganha direção.\n\nNa prática, o servo precisa aprender a ouvir uma pregação com responsabilidade. Qual é o texto-base? Qual é a ideia central? Qual aplicação foi dada? Que frase resume sem reduzir? O que não pode ser recortado fora de contexto? Comunicação fiel começa com escuta fiel.",
        "youtubeUrl": "https://www.youtube.com/watch?v=7HC8lPB36OQ",
        "driveDocUrl": "https://docs.google.com/document/d/1sDUw3icBJ15TIaq8Iw_M2E_WnCSX6xru",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1wvRfg9aivYoAr7U64z4brcU2dFXC1iIN",
        "devotional": {
          "title": "Devocional 01 - Palavra, Púlpito e Comunicação",
          "bibleReference": "2 Timóteo 4:1-5",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, uma tensão e uma resposta de obediência.",
          "guidedMeditation": "Leia 2 Timóteo 4:1-5 na NVI. Sinta o peso da ordem de Paulo. A Palavra não é acessório. Ela é centro. Em uma cultura de distração, a igreja não pode tratar a Escritura como legenda decorativa.\n\nHoje, ore por temor. Temor não é medo paralisante, mas consciência de que lidamos com coisas santas. Quando você comunica algo da igreja, você não está apenas preenchendo calendário; está ajudando pessoas a interpretarem uma mensagem espiritual.\n\nPeça a Deus ouvidos melhores. Antes de escrever, editar ou publicar, aprenda a escutar. Escute o texto bíblico, a pregação, a liderança e as pessoas que vão receber. Comunicação fiel nasce de escuta humilde.",
          "suggestedPrayer": "Senhor, guarda minha criatividade de distorcer Tua Palavra. Que eu comunique com clareza, reverência e fidelidade. Que o formato sirva ao trilho da mensagem.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      },
      {
        "title": "Aula 02 - Técnica, Arte e Ferramentas",
        "order": 2,
        "objective": "Valorizar técnica, arte e ferramenta como formas de serviço espiritual, sem colocar a performance no centro.",
        "bibleReferences": "Êxodo 31:1-6; Eclesiastes 10:10; 1 Crônicas 25:6-7; Colossenses 3:17",
        "openingQuestion": "Como usar técnica e arte como serviço espiritual, sem idolatrar performance?",
        "summary": "Êxodo 31 mostra Deus capacitando pessoas com habilidade, inteligência, conhecimento e capacidade artística. Isso derruba a falsa separação entre espiritual e técnico. Deus se importa com habilidade. Técnica pode ser parte da adoração quando está rendida ao propósito de Deus.\n\nEclesiastes 10:10 ensina que ferramenta sem fio exige mais força. No ministério, falta de preparo cansa a pessoa e pesa sobre a equipe. Estudar ferramenta, aprender edição, melhorar escrita, organizar arquivos e treinar olhar não são vaidade quando o objetivo é servir melhor.\n\n1 Crônicas mostra músicos preparados e instruídos. A adoração bíblica não despreza preparo. Espontaneidade não é desculpa para desleixo. Ao mesmo tempo, preparo não é palco para ego. A técnica certa no coração errado vira exibição. A técnica certa no coração rendido vira serviço.\n\nFerramentas mudam. Hoje é uma plataforma, amanhã outra. O servo não adora ferramenta. Aprende ferramenta. Usa ferramenta. Submete ferramenta à mensagem. Isso protege a equipe de duas tentações: rejeitar toda novidade por medo ou abraçar toda novidade por vaidade.\n\nA Coroado precisa de gente que una mão treinada e coração quebrantado. Uma entrega tecnicamente boa pode aliviar ruído, facilitar entendimento e honrar quem recebe. Mas a entrega só é espiritualmente saudável quando continua apontando para Cristo, não para o talento do executor.",
        "youtubeUrl": "https://www.youtube.com/watch?v=7HC8lPB36OQ",
        "driveDocUrl": "https://docs.google.com/document/d/19jaTmNZL7X6HsvQnniwpn2RfOJN28NXY",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1My53ZiW-g9yUqg3otupcClm6-AmcitU5",
        "devotional": {
          "title": "Devocional 02 - Técnica, Arte e Ferramentas",
          "bibleReference": "Êxodo 31:1-6",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, uma tensão e uma resposta de obediência.",
          "guidedMeditation": "Leia Êxodo 31:1-6 na NVI. Veja como Deus se importa com habilidade, beleza e construção. O Deus que chama também capacita. O Deus que enche pelo Espírito também dá inteligência prática para realizar a obra.\n\nHoje, agradeça a Deus por uma habilidade específica. Depois, peça perdão por qualquer lugar em que essa habilidade virou fonte de orgulho ou comparação. Técnica é dom perigoso quando o coração está desalinhado.\n\nEscolha uma ferramenta ou disciplina para desenvolver com humildade. Não para provar valor, mas para servir melhor. Aprender pode ser adoração quando nasce de mordomia.",
          "suggestedPrayer": "Senhor, enche minha técnica de humildade e minha criatividade de obediência. Que minhas mãos treinadas sirvam ao Teu povo e não ao meu ego.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      },
      {
        "title": "Aula 03 - Feedback, Revisão e Entrega",
        "order": 3,
        "objective": "Criar postura de aprendiz e confiabilidade operacional no novo integrante.",
        "bibleReferences": "Provérbios 27:17; Provérbios 15:22; Lucas 16:10; Hebreus 12:11",
        "openingQuestion": "Por que revisar, ouvir e ajustar também fazem parte da espiritualidade do servo?",
        "summary": "Provérbios valoriza conselho porque o ser humano se engana sozinho com facilidade. Feedback não é inimigo da criatividade. É ferramenta de lapidação. Quem rejeita toda correção coloca o ego acima da missão. Quem aceita qualquer correção sem discernimento também pode se perder. Maturidade aprende a ouvir, filtrar e crescer.\n\nRevisão é cuidado com pessoas. Um erro de informação, horário, tom ou contexto pode confundir gente real. No ministério, detalhes pequenos carregam pessoas. Uma data errada atrapalha presença. Uma frase mal colocada pode ferir. Um corte fora de contexto pode distorcer a mensagem.\n\nLucas 16:10 ensina fidelidade no pouco. Antes de grandes responsabilidades, Deus forma constância em tarefas simples: responder, avisar, revisar, entregar, aprender. O servo confiável não é o que nunca erra, mas o que leva a sério o processo e aprende rápido com o erro.\n\nHebreus 12 lembra que disciplina nem sempre parece agradável no momento, mas produz fruto. Feedback pode doer porque toca identidade falsa. Se eu confundo entrega com valor pessoal, qualquer ajuste parece rejeição. Mas se minha identidade está em Cristo, correção vira formação.\n\nA cultura de revisão precisa ser espiritual e operacional. Espiritual porque exige humildade. Operacional porque cria padrão. O novo integrante deve aprender a revisar mensagem, ortografia, horário, formato, alinhamento, autorização e destino antes de entregar.",
        "youtubeUrl": "https://www.youtube.com/watch?v=7HC8lPB36OQ",
        "driveDocUrl": "https://docs.google.com/document/d/1qVh46Mv47-tUd9RBsBrz6zRKpKlwTey0",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1NT_OoyuL79XoX0IyE947E5WdqVe-_-tF",
        "devotional": {
          "title": "Devocional 03 - Feedback, Revisão e Entrega",
          "bibleReference": "Provérbios 27:17",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, uma tensão e uma resposta de obediência.",
          "guidedMeditation": "Leia Provérbios 27:17 na NVI. Deus usa pessoas para afiar pessoas. Às vezes Ele usa encorajamento. Às vezes usa correção. Às vezes usa alguém que percebe o que você ainda não percebeu.\n\nHoje, ore por um coração corrigível. Peça a Deus que você não confunda feedback com rejeição. Correção não precisa ameaçar sua identidade quando sua identidade está segura em Cristo.\n\nPense na última correção que recebeu. O que havia de verdade nela? O que Deus pode formar em você através disso? Mesmo quando o tom de alguém não foi perfeito, ainda pode haver algo a aprender com humildade e discernimento.",
          "suggestedPrayer": "Senhor, dá-me mansidão para ouvir, sabedoria para discernir e coragem para ajustar. Que eu seja confiável no simples e fiel no pouco.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      }
    ]
  },
  {
    "title": "Tema 5 - Integração, Nivelamento e Envio",
    "description": "O processo final de consolidação, nivelamento prático de novas mídias e envio oficial para atuação regular.",
    "order": 5,
    "lessons": [
      {
        "title": "Aula 01 - Servir Acompanhado",
        "order": 1,
        "objective": "Ensinar a importância de mentoria, observação, prática supervisionada e transmissão de cultura.",
        "bibleReferences": "2 Timóteo 2:2; Atos 16:1-5; 1 Tessalonicenses 2:8",
        "openingQuestion": "Por que ninguém deveria começar servindo sozinho?",
        "summary": "Paulo orienta Timóteo a confiar a pessoas fiéis aquilo que recebeu. Isso é discipulado multiplicador. O conhecimento não morre em uma pessoa; passa adiante com fidelidade. Ministério saudável não depende de uma pessoa indispensável, mas forma gente capaz de carregar a visão.\n\nAtos 16 mostra Timóteo entrando na jornada com Paulo. Ele não foi apenas colocado em uma escala. Caminhou junto. Aprendeu cultura, discernimento, ritmo, sofrimento e missão. Isso mostra que formação não acontece apenas por apostila; acontece por convivência orientada.\n\nServir acompanhado protege o novo servo e protege a igreja. O mentor corrige antes que o erro vire padrão, explica antes que a dúvida vire insegurança e encoraja antes que o cansaço vire desistência. Acompanhamento não é controle; é cuidado.\n\nMuita gente quer começar assumindo tudo, porque confunde oportunidade com validação. Mas maturidade aceita processo. Observar não é atraso. Ajudar não é menor. Aprender bastidor não é desperdício. Deus forma servos no caminho, não apenas no palco da entrega final.\n\nNa Coroado, integração precisa transmitir técnica e cultura. A pessoa precisa saber o que fazer, mas também precisa entender por que fazemos assim. Sem cultura, a técnica vira tarefa solta. Com cultura, a técnica entra na visão da igreja.",
        "youtubeUrl": "https://www.youtube.com/watch?v=zOnfCOv6lU8",
        "driveDocUrl": "https://docs.google.com/document/d/1Bnj5cshXUQjLcJpwaJmk57UNhMnwYqLq",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1DuzPu5wRweoWq5oA1S5mnNsj5Ue6pp-d",
        "devotional": {
          "title": "Devocional 01 - Servir Acompanhado",
          "bibleReference": "2 Timóteo 2:2",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, uma tensão e uma resposta de obediência.",
          "guidedMeditation": "Leia 2 Timóteo 2:2 na NVI. Veja a lógica de transmissão: alguém recebeu, guardou, confiou e preparou outros. Isso é mais profundo do que repassar informação. É formar continuidade.\n\nHoje, ore por um coração discipulável. A pressa de assumir pode esconder orgulho ou insegurança. Peça a Deus humildade para observar, perguntar e aprender sem se sentir menor.\n\nPense em alguém que pode te acompanhar. Ore por essa pessoa. Peça também que Deus te faça honrar quem chegou antes, sem idolatrar ninguém e sem desprezar experiência.",
          "suggestedPrayer": "Senhor, eu não quero apenas uma função. Quero formação. Dá-me humildade para aprender acompanhado e fidelidade para transmitir o que recebo.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      },
      {
        "title": "Aula 02 - Avaliação e Crescimento Contínuo",
        "order": 2,
        "objective": "Explicar o nivelamento como conversa honesta para diagnóstico, desenvolvimento e reconhecimento.",
        "bibleReferences": "2 Coríntios 13:5; Salmo 139:23-24; Provérbios 11:14; Hebreus 12:11",
        "openingQuestion": "Como avaliar sem transformar o processo em julgamento ou performance?",
        "summary": "2 Coríntios 13 chama ao exame. A vida cristã inclui olhar para dentro diante de Deus. Avaliação no ministério não deve ser punição; deve ser luz. Sem luz, crescemos no escuro. O problema não é ser avaliado. O problema é transformar avaliação em identidade.\n\nO Documento 05 fala de diagnóstico e desenvolvimento. Isso é saudável: entender onde cada servo está espiritualmente, culturalmente e tecnicamente para definir próximos passos reais. Uma pessoa pode ter habilidade técnica e fragilidade cultural. Outra pode ter coração excelente e precisar de treino. Avaliação ajuda a cuidar de cada caso.\n\nSalmo 139 ensina uma oração corajosa: pedir que Deus sonde o coração. Antes de qualquer líder avaliar uma entrega, Deus já vê motivações, medos, vaidades e feridas. Isso torna a avaliação humana menos ameaçadora, porque a luz principal vem do Senhor.\n\nHebreus 12 lembra que disciplina produz fruto depois. No momento, nem sempre parece agradável. Mas avaliação com graça e verdade pode livrar o servo de repetir padrões que o impedem de amadurecer. A pergunta certa não é: isso prova que sou ruim? A pergunta certa é: que próximo passo Deus está me mostrando?\n\nCrescimento contínuo precisa de plano. Não basta dizer 'preciso melhorar'. Melhorar em quê? Em qual prazo? Com qual prática? Com quem acompanhando? O nivelamento deve terminar em ações concretas, não em sensação vaga.",
        "youtubeUrl": "https://www.youtube.com/watch?v=zOnfCOv6lU8",
        "driveDocUrl": "https://docs.google.com/document/d/1vshl9pEnI9tnuSIWyWwfMuJip_AdLsB7",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1V8UmBIfzCQ2wSefluIRRes_dH0_7MsaE",
        "devotional": {
          "title": "Devocional 02 - Avaliação e Crescimento Contínuo",
          "bibleReference": "2 Coríntios 13:5",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, uma tensão e uma resposta de obediência.",
          "guidedMeditation": "Leia Salmo 139:23-24 na NVI. Essa oração é simples e profunda: pedir que Deus sonde, prove e conduza. É uma oração para quem não quer viver defendendo imagem.\n\nHoje, convide Deus para avaliar sua vida antes de qualquer pessoa avaliar sua entrega. Peça que Ele mostre motivações escondidas, padrões repetidos e áreas que precisam de cura ou disciplina.\n\nDepois, transforme luz em próximo passo. Deus não revela para esmagar. Ele revela para conduzir. Escolha uma área de crescimento e escreva uma ação concreta para esta semana.",
          "suggestedPrayer": "Senhor, sonda meu coração. Mostra o que preciso ver sem me esconder. Dá-me coragem para crescer com verdade, graça e constância.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      },
      {
        "title": "Aula 03 - Enviados para Frutificar",
        "order": 3,
        "objective": "Conectar toda a trilha a fruto, missão, discipulado e multiplicação.",
        "bibleReferences": "João 15:8-16; Mateus 9:37-38; Atos 13:1-3; Apocalipse 7:9-10",
        "openingQuestion": "Para onde essa formação quer nos levar?",
        "summary": "Jesus diz que o Pai é glorificado quando damos fruto. Fruto não é apenas agenda cheia. É vida que permanece, pessoas discipuladas, serviço fiel, maturidade visível e Cristo sendo anunciado. A trilha não existe para preencher escala; existe para formar trabalhadores maduros.\n\nMateus 9 mostra que a seara é grande e os trabalhadores são poucos. Jesus não manda primeiro reclamar da falta de gente; manda orar ao Senhor da seara. Isso muda o tom da liderança e do serviço. Antes de cobrar mais trabalhadores, a igreja ora, forma e envia.\n\nAtos 13 mostra uma igreja que adora, ouve o Espírito e envia. O envio não nasce de ansiedade por crescimento. Nasce de adoração e obediência. Isso é importante: ser enviado não é ser usado como peça de máquina; é participar da missão de Deus a partir da comunhão com Ele.\n\nComunicação, célula e serviço ministerial participam da mesma missão. Um post pode abrir uma porta. Uma célula pode cuidar da pessoa que entrou. Um servo maduro pode discipular alguém que acabou de chegar. Uma boa comunicação não termina em engajamento; aponta para caminho de discipulado.\n\nO novo integrante precisa sair da trilha com senso de envio. Não apenas 'agora posso servir na escala', mas 'agora entendo que meu dom encontra a necessidade do corpo e a missão da igreja'. Esse é o alvo: servos que frutificam, permanecem e ajudam outros a caminhar.",
        "youtubeUrl": "https://www.youtube.com/watch?v=zOnfCOv6lU8",
        "driveDocUrl": "https://docs.google.com/document/d/1d-BiLdQ0eP6DC1ZzoumJYoqFNYR3ENpw",
        "driveSlideUrl": "https://docs.google.com/presentation/d/1p6ohiNoU-31qR6q_xOc1cT5jJHUMWal6",
        "devotional": {
          "title": "Devocional 03 - Enviados para Frutificar",
          "bibleReference": "João 15:8-16",
          "readingInstruction": "Antes de começar, leia o texto bíblico na NVI em voz baixa. Depois leia novamente procurando uma palavra, uma tensão e uma resposta de obediência.",
          "guidedMeditation": "Leia João 15:8-16 na NVI. Jesus fala de fruto, permanência, amor e escolha. O fruto que glorifica o Pai não nasce de ansiedade, mas de permanência obediente.\n\nHoje, entregue ao Senhor sua pressa por resultado. Peça fidelidade antes de visibilidade. Peça fruto que permaneça, não apenas movimento que impressiona por um tempo.\n\nOre também por trabalhadores. Não de forma genérica. Peça que Deus levante pessoas na Coroado com maturidade, amor pela igreja, disposição de aprender e coragem para servir. E inclua seu nome nessa oração.",
          "suggestedPrayer": "Senhor da seara, envia trabalhadores. Forma-me como um deles. Que meu dom encontre a necessidade do corpo e que minha vida produza fruto que permanece.",
          "weeklyPractice": "Separe dez minutos sem tela. Ore uma frase curta a partir do texto. Depois escreva uma decisão prática para as próximas 24 horas. O devocional não termina quando emociona; termina quando vira obediência possível."
        }
      }
    ]
  }
];

import { collection, addDoc, getDocs, writeBatch, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { extractYouTubeId } from './utils/driveParser';

export async function healLesson1Video() {
  try {
    const modulesSnap = await getDocs(collection(db, 'modules'));
    const moduleOrderMap: Record<string, number> = {};
    modulesSnap.docs.forEach(docSnap => {
      const d = docSnap.data();
      const mId = docSnap.id;
      let mOrder = d.order ?? 999;
      if (mOrder === 999 && d.title) {
        const match = d.title.match(/Tema\s*([0-9]+)/i) || d.title.match(/([0-9]+)/);
        if (match) mOrder = parseInt(match[1]);
      }
      moduleOrderMap[mId] = mOrder;
    });

    const lessonsSnap = await getDocs(collection(db, 'lessons'));
    let healedCount = 0;

    const brokenIds = [
      "dQw4w9WgXcQ",
      "68E6qZf1rA0",
      "R0_qS1n_R6M",
      "tQo4BkaInbI",
      "T_7bM1p5e5o",
      "KzI-tpxR84Y",
      "f0bSg_R77u8",
      "9_C8M_oPzQk",
      "NWe7gWhkOos",
      "Y_Vb0j5Lh2U",
      "Vl0Xv_87mK0",
      "Q-9Xv_zEIsI",
      "GId2lK2G3cE",
      "x0b6M4a7nFs",
      "7X7l9X7nB-M"
    ];

    const videoMapping: Record<string, { url: string; id: string }> = {
      "1_1": { url: "https://www.youtube.com/watch?v=7HC8lPB36OQ", id: "7HC8lPB36OQ" },
      "1_2": { url: "https://www.youtube.com/watch?v=pIy82P1_3e4", id: "pIy82P1_3e4" },
      "1_3": { url: "https://www.youtube.com/watch?v=3rzhBrWK4uQ", id: "3rzhBrWK4uQ" },
      "2_1": { url: "https://www.youtube.com/watch?v=zOnfCOv6lU8", id: "zOnfCOv6lU8" },
      "2_2": { url: "https://www.youtube.com/watch?v=zOnfCOv6lU8", id: "zOnfCOv6lU8" },
      "2_3": { url: "https://www.youtube.com/watch?v=zOnfCOv6lU8", id: "zOnfCOv6lU8" },
      "3_1": { url: "https://www.youtube.com/watch?v=zOnfCOv6lU8", id: "zOnfCOv6lU8" },
      "3_2": { url: "https://www.youtube.com/watch?v=zOnfCOv6lU8", id: "zOnfCOv6lU8" },
      "3_3": { url: "https://www.youtube.com/watch?v=zOnfCOv6lU8", id: "zOnfCOv6lU8" },
      "4_1": { url: "https://www.youtube.com/watch?v=7HC8lPB36OQ", id: "7HC8lPB36OQ" },
      "4_2": { url: "https://www.youtube.com/watch?v=7HC8lPB36OQ", id: "7HC8lPB36OQ" },
      "4_3": { url: "https://www.youtube.com/watch?v=7HC8lPB36OQ", id: "7HC8lPB36OQ" },
      "5_1": { url: "https://www.youtube.com/watch?v=zOnfCOv6lU8", id: "zOnfCOv6lU8" },
      "5_2": { url: "https://www.youtube.com/watch?v=zOnfCOv6lU8", id: "zOnfCOv6lU8" },
      "5_3": { url: "https://www.youtube.com/watch?v=zOnfCOv6lU8", id: "zOnfCOv6lU8" },
    };

    for (const d of lessonsSnap.docs) {
      const data = d.data();
      const mId = data.moduleId;
      const mOrder = moduleOrderMap[mId] || 999;

      let lOrder = data.order ?? 999;
      if (lOrder === 999 && data.title) {
        const match = data.title.match(/Aula\s*([0-9]+)/i) || data.title.match(/([0-9]+)/);
        if (match) lOrder = parseInt(match[1]);
      }

      const key = `${mOrder}_${lOrder}`;
      const correctVideo = videoMapping[key];

      if (correctVideo) {
        const isCurrentlyFallback = (data.youtubeVideoId === "7HC8lPB36OQ" && key !== "1_1" && key !== "4_1" && key !== "4_2" && key !== "4_3") ||
                                    (data.youtubeVideoId === "zOnfCOv6lU8" && !["2_1", "2_2", "2_3", "3_1", "3_2", "3_3", "5_1", "5_2", "5_3"].includes(key));

        const isPlaceholder = !data.youtubeVideoId || 
                              brokenIds.includes(data.youtubeVideoId) || 
                              isCurrentlyFallback ||
                              !data.youtubeUrl || 
                              data.youtubeUrl.includes("dQw4w9WgXcQ") ||
                              brokenIds.some(bid => data.youtubeUrl.includes(bid)) ||
                              data.youtubeUrl === "";

        if (isPlaceholder && (data.youtubeVideoId !== correctVideo.id || data.youtubeUrl !== correctVideo.url)) {
          console.log(`Auto-healing lesson ${d.id} [${data.title}] (Key: ${key}) to video ${correctVideo.id}...`);
          await updateDoc(doc(db, 'lessons', d.id), {
            youtubeUrl: correctVideo.url,
            youtubeVideoId: correctVideo.id,
            updatedAt: new Date().toISOString()
          });
          healedCount++;
        }
      }
    }
    console.log(`Heal check finished. Updated ${healedCount} matching lessons.`);
  } catch (err) {
    console.error("Failed to run automatic lesson healing:", err);
  }
}

export async function checkAndSeedDatabase() {
  try {
    const modulesSnap = await getDocs(collection(db, 'modules'));
    if (!modulesSnap.empty) {
      console.log('Database already has modules, skipping automatic seed.');
      return false;
    }
    await forceSeedDatabase();
    return true;
  } catch (error) {
    console.error('Failed to auto seed database:', error);
    return false;
  }
}

export async function forceSeedDatabase() {
  console.log('Starting seed operations...');

  // 0. Clean up existing collections to prevent duplicates
  const collectionsToClean = ['modules', 'lessons', 'devotionals', 'supportMaterials'];
  for (const collectionName of collectionsToClean) {
    const snap = await getDocs(collection(db, collectionName));
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, collectionName, d.id)));
    await Promise.all(deletePromises);
  }

  for (const t of seedThemesAndLessons) {
    // 1. Create Theme (Module)
    const moduleRef = await addDoc(collection(db, 'modules'), {
      title: t.title,
      description: t.description,
      order: t.order,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const moduleId = moduleRef.id;

    for (const l of t.lessons) {
      // 2. Create Lesson
      const lessonRef = await addDoc(collection(db, 'lessons'), {
        moduleId,
        title: l.title,
        order: l.order,
        objective: l.objective,
        bibleReferences: l.bibleReferences,
        openingQuestion: l.openingQuestion,
        summary: l.summary,
        youtubeUrl: l.youtubeUrl,
        youtubeVideoId: extractYouTubeId(l.youtubeUrl),
        driveDocUrl: l.driveDocUrl,
        driveSlideUrl: l.driveSlideUrl,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const lessonId = lessonRef.id;

      // 3. Create Associated Devotional
      await addDoc(collection(db, 'devotionals'), {
        lessonId,
        title: l.devotional.title,
        bibleReference: l.devotional.bibleReference,
        readingInstruction: l.devotional.readingInstruction,
        guidedMeditation: l.devotional.guidedMeditation,
        suggestedPrayer: l.devotional.suggestedPrayer,
        weeklyPractice: l.devotional.weeklyPractice,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 4. Create support material
      await addDoc(collection(db, 'supportMaterials'), {
        lessonId,
        moduleId,
        title: `Material Auxiliar - ${l.title}`,
        description: `Material de leitura aprofundada para consolidação do tema da aula e prática semanal.`,
        type: "drive",
        url: l.driveDocUrl,
        required: true,
        visibility: "servos",
        order: 1,
        active: true,
        createdAt: new Date().toISOString()
      });
    }
  }

  // Create initial visual customization settings
  const checkSettings = await getDocs(collection(db, 'platformSettings'));
  if (checkSettings.empty) {
    await addDoc(collection(db, 'platformSettings'), {
      name: "CRD COMM",
      mainPhrase: "Conectamos pessoas a Jesus, discípulos a células e a Igreja à cidade.",
      supportPhrase: 'Tudo quanto fizerdes, por palavra ou por obra, fazei tudo em nome do Senhor Jesus."  — Colossenses 3:17',
      contactEmail: "marcospereirahubner@gmail.com",
      primaryColor: "indigo",
      secondaryColor: "blue"
    });
  }
}
