import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Dado1 from '../../assets/images/dados/1.svg';
import Dado2 from '../../assets/images/dados/2.svg';
import Dado3 from '../../assets/images/dados/3.svg';
import Dado4 from '../../assets/images/dados/4.svg';
import Dado5 from '../../assets/images/dados/5.svg';
import Dado6 from '../../assets/images/dados/6.svg';
import Vazio from '../../assets/images/dados/vazio.svg';

const TOTAL_RODADAS = 5;

type Jogador = 1 | 2;
type ValorDado = number | null;

type Placar = {
  jogador1: number;
  jogador2: number;
  empates: number;
};

type EstadoJogo = {
  rodada: number;
  dadosJogador1: [ValorDado, ValorDado];
  dadosJogador2: [ValorDado, ValorDado];
  turno: 0 | Jogador;
  placar: Placar;
  mensagem: string;
  resolvendoRodada: boolean;
  jogoFinalizado: boolean;
  mensagemFinal: string;
};

function rolarDado(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function estadoInicial(): EstadoJogo {
  return {
    rodada: 1,
    dadosJogador1: [null, null],
    dadosJogador2: [null, null],
    turno: 1,
    placar: {
      jogador1: 0,
      jogador2: 0,
      empates: 0,
    },
    mensagem: '',
    resolvendoRodada: false,
    jogoFinalizado: false,
    mensagemFinal: '',
  };
}

function Dado({ valor }: { valor: ValorDado }) {
  const imagens = {
    1: Dado1,
    2: Dado2,
    3: Dado3,
    4: Dado4,
    5: Dado5,
    6: Dado6,
  };

  const Imagem =
    valor !== null && Number.isInteger(valor) && valor >= 1 && valor <= 6
      ? imagens[valor as keyof typeof imagens]
      : Vazio;

  return (
    <View style={styles.dado}>
      <Imagem width={58} height={58} />
    </View>
  );
}

export default function Index() {
  const [estado, setEstado] = useState<EstadoJogo>(estadoInicial);

  useEffect(() => {
    if (!estado.resolvendoRodada) {
      return;
    }

    const timer = setTimeout(() => {
      setEstado((anterior) => ({
        ...anterior,
        rodada: anterior.rodada + 1,
        dadosJogador1: [null, null],
        dadosJogador2: [null, null],
        turno: 1,
        mensagem: '',
        resolvendoRodada: false,
      }));
    }, 1400);

    return () => clearTimeout(timer);
  }, [estado.resolvendoRodada]);

  function jogar(jogador: Jogador) {
    setEstado((anterior) => {
      if (
        anterior.jogoFinalizado ||
        anterior.resolvendoRodada ||
        jogador !== anterior.turno
      ) {
        return anterior;
      }

      const novosDados: [number, number] = [
        rolarDado(),
        rolarDado(),
      ];

      if (jogador === 1) {
        return {
          ...anterior,
          dadosJogador1: novosDados,
          turno: 2,
        };
      }

      const somaJogador1 =
        anterior.dadosJogador1[0]! + anterior.dadosJogador1[1]!;

      const somaJogador2 = novosDados[0] + novosDados[1];

      const placar = { ...anterior.placar };
      let mensagem: string;

      if (somaJogador1 > somaJogador2) {
        mensagem = 'Jogador 1 venceu a rodada!';
        placar.jogador1 += 1;
      } else if (somaJogador2 > somaJogador1) {
        mensagem = 'Jogador 2 venceu a rodada!';
        placar.jogador2 += 1;
      } else {
        mensagem = 'Empate!';
        placar.empates += 1;
      }

      const ultimaRodada = anterior.rodada >= TOTAL_RODADAS;

      if (ultimaRodada) {
        let mensagemFinal: string;

        if (placar.jogador1 > placar.jogador2) {
          mensagemFinal = 'Jogador 1 venceu o jogo!';
        } else if (placar.jogador2 > placar.jogador1) {
          mensagemFinal = 'Jogador 2 venceu o jogo!';
        } else {
          mensagemFinal = 'Empate geral!';
        }

        return {
          ...anterior,
          dadosJogador2: novosDados,
          placar,
          mensagem,
          turno: 0,
          jogoFinalizado: true,
          mensagemFinal,
        };
      }

      return {
        ...anterior,
        dadosJogador2: novosDados,
        placar,
        mensagem,
        turno: 0,
        resolvendoRodada: true,
      };
    });
  }

  function jogarNovamente() {
    setEstado(estadoInicial());
  }

  const {
    rodada,
    dadosJogador1,
    dadosJogador2,
    turno,
    placar,
    mensagem,
    jogoFinalizado,
    mensagemFinal,
  } = estado;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <View style={styles.conteudo}>
        <Text style={styles.titulo}>Jogo de Dados</Text>

        <Text style={styles.subtitulo}>
          Desafie seu adversário!
        </Text>

        <View style={styles.rodadaContainer}>
          <Text style={styles.rodada}>
            RODADA {rodada} / {TOTAL_RODADAS}
          </Text>
        </View>

        <View style={styles.jogadores}>
          <View style={styles.jogador}>
            <Text style={styles.nomeJogador}>Jogador 1</Text>

            <View style={styles.dadosRow}>
              <Dado valor={dadosJogador1[0]} />
              <Dado valor={dadosJogador1[1]} />
            </View>

            <Pressable
              style={[
                styles.botao,
                turno !== 1 || jogoFinalizado
                  ? styles.botaoDesativado
                  : null,
              ]}
              onPress={() => jogar(1)}
              disabled={turno !== 1 || jogoFinalizado}
            >
              <Text style={styles.textoBotao}>
                {turno === 1 && !jogoFinalizado
                  ? 'Jogar'
                  : 'Aguarde'}
              </Text>
            </Pressable>

            <Text style={styles.pontos}>
              Vitórias: {placar.jogador1}
            </Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.jogador}>
            <Text style={styles.nomeJogador}>Jogador 2</Text>

            <View style={styles.dadosRow}>
              <Dado valor={dadosJogador2[0]} />
              <Dado valor={dadosJogador2[1]} />
            </View>

            <Pressable
              style={[
                styles.botao,
                turno !== 2 || jogoFinalizado
                  ? styles.botaoDesativado
                  : null,
              ]}
              onPress={() => jogar(2)}
              disabled={turno !== 2 || jogoFinalizado}
            >
              <Text style={styles.textoBotao}>
                {turno === 2 && !jogoFinalizado
                  ? 'Jogar'
                  : 'Aguarde'}
              </Text>
            </Pressable>

            <Text style={styles.pontos}>
              Vitórias: {placar.jogador2}
            </Text>
          </View>
        </View>

        <View style={styles.placarContainer}>
          <Text style={styles.placarTitulo}>PLACAR</Text>

          <View style={styles.placarLinha}>
            <Text style={styles.placarTexto}>
              Jogador 1: {placar.jogador1}
            </Text>

            <Text style={styles.placarTexto}>
              Jogador 2: {placar.jogador2}
            </Text>
          </View>

          <Text style={styles.empates}>
            Empates: {placar.empates}
          </Text>
        </View>

        <View style={styles.mensagemBox}>
          <Text style={styles.mensagem}>
            {jogoFinalizado
              ? mensagemFinal
              : mensagem || 'Aguardando jogada...'}
          </Text>
        </View>

        {jogoFinalizado && (
          <Pressable
            style={styles.botaoNovamente}
            onPress={jogarNovamente}
          >
            <Text style={styles.textoBotao}>
              Jogar novamente
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },

  conteudo: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitulo: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },

  rodadaContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },

  rodada: {
    color: '#FBBF24',
    fontSize: 17,
    fontWeight: 'bold',
  },

  jogadores: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  jogador: {
    flex: 1,
    alignItems: 'center',
  },

  nomeJogador: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 18,
  },

  dadosRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },

  dado: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  imagemDado: {
    width: 58,
    height: 58,
    resizeMode: 'contain',
  },

  dadoVazio: {
    width: 58,
    height: 58,
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B7280',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  interrogacao: {
    color: '#D1D5DB',
    fontSize: 26,
    fontWeight: 'bold',
  },

  botao: {
    backgroundColor: '#FBBF24',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 100,
  },

  botaoDesativado: {
    backgroundColor: '#4B5563',
  },

  textoBotao: {
    color: '#111827',
    fontSize: 15,
    fontWeight: 'bold',
  },

  pontos: {
    color: '#D1D5DB',
    marginTop: 14,
    fontSize: 13,
  },

  divisor: {
    width: 1,
    height: 150,
    backgroundColor: '#374151',
    marginHorizontal: 10,
  },

  placarContainer: {
    backgroundColor: '#1F2937',
    padding: 18,
    borderRadius: 14,
    marginTop: 30,
    alignItems: 'center',
  },

  placarTitulo: {
    color: '#FBBF24',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  placarLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  placarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  empates: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 10,
  },

  mensagemBox: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 18,
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 65,
  },

  mensagem: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  botaoNovamente: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
});