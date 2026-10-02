/**
 * imagem_rodape.js
 *
 * Cria uma cópia da imagem com uma faixa branca
 * acrescentada no rodapé e grava o nome do arquivo nela.
 *
 * A imagem original no servidor NÃO é alterada.
 */

(function () {

  'use strict';


  /*
  |--------------------------------------------------------------------------
  | Remove extensão do nome
  |--------------------------------------------------------------------------
  */

  function nomeSemExtensao(nome) {

    const base =
      String(nome || '')
        .split('/')
        .pop()
        .split('\\')
        .pop();

    return base.replace(
      /\.[^.]+$/,
      ''
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Carrega imagem usando elemento IMG
  |--------------------------------------------------------------------------
  */

  function carregarImagemViaElemento(blob) {

    return new Promise(
      (resolve, reject) => {

        const url =
          URL.createObjectURL(
            blob
          );

        const img =
          new Image();


        img.onload =
          () => {

            URL.revokeObjectURL(
              url
            );

            resolve(
              img
            );

          };


        img.onerror =
          () => {

            URL.revokeObjectURL(
              url
            );

            reject(
              new Error(
                'Não foi possível abrir a imagem para inserir o rodapé.'
              )
            );

          };


        img.src =
          url;

      }
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Carrega imagem
  |--------------------------------------------------------------------------
  */

  async function carregarImagem(blob) {

    /*
     * Tenta createImageBitmap primeiro.
     * É mais rápido para imagens grandes.
     */
    if (
      'createImageBitmap'
      in window
    ) {

      try {

        return await createImageBitmap(
          blob
        );

      }
      catch (_) {

        /*
         * Usa fallback abaixo.
         */

      }

    }


    return carregarImagemViaElemento(
      blob
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Canvas → Blob JPEG
  |--------------------------------------------------------------------------
  */

  function canvasParaBlob(
    canvas,
    qualidade
  ) {

    return new Promise(
      (resolve, reject) => {

        canvas.toBlob(

          blob => {

            if (!blob) {

              reject(
                new Error(
                  'Não foi possível gerar a imagem com rodapé.'
                )
              );

              return;

            }

            resolve(
              blob
            );

          },

          'image/jpeg',

          qualidade

        );

      }
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Adiciona rodapé
  |--------------------------------------------------------------------------
  |
  | Recebe:
  |
  | blobOriginal
  | nomeArquivo
  |
  | Retorna:
  |
  | novo Blob JPG
  |
  */

  async function adicionarRodapeNome(
    blobOriginal,
    nomeArquivo,
    opcoes = {}
  ) {

    if (
      !(blobOriginal instanceof Blob)
    ) {

      throw new Error(
        'Imagem inválida para geração do rodapé.'
      );

    }


    const imagem =
      await carregarImagem(
        blobOriginal
      );


    const largura =
      imagem.width
      ||
      imagem.naturalWidth;


    const altura =
      imagem.height
      ||
      imagem.naturalHeight;


    if (
      !largura
      ||
      !altura
    ) {

      if (
        typeof imagem.close ===
        'function'
      ) {

        imagem.close();

      }


      throw new Error(
        'Não foi possível identificar as dimensões da imagem.'
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Dimensões proporcionais
    |--------------------------------------------------------------------------
    |
    | 300 DPI:
    | largura ~2480
    | rodapé ~94px
    |
    | 600 DPI:
    | largura ~4960
    | rodapé ~188px
    |
    */

    const alturaRodape =
      Math.max(

        70,

        Math.round(
          largura *
          (
            opcoes.proporcaoRodape
            ??
            0.038
          )
        )

      );


    const paddingHorizontal =
      Math.max(

        24,

        Math.round(
          largura *
          0.018
        )

      );


    const tamanhoFonte =
      Math.max(

        26,

        Math.round(
          largura *
          (
            opcoes.proporcaoFonte
            ??
            0.0135
          )
        )

      );


    /*
    |--------------------------------------------------------------------------
    | Canvas final
    |--------------------------------------------------------------------------
    */

    const canvas =
      document.createElement(
        'canvas'
      );


    canvas.width =
      largura;


    canvas.height =
      altura +
      alturaRodape;


    const ctx =
      canvas.getContext(
        '2d',
        {
          alpha:
            false
        }
      );


    if (!ctx) {

      if (
        typeof imagem.close ===
        'function'
      ) {

        imagem.close();

      }


      throw new Error(
        'Canvas indisponível para inserir o rodapé.'
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Fundo branco
    |--------------------------------------------------------------------------
    */

    ctx.fillStyle =
      '#ffffff';


    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


    /*
    |--------------------------------------------------------------------------
    | Imagem original
    |--------------------------------------------------------------------------
    */

    ctx.drawImage(
      imagem,
      0,
      0,
      largura,
      altura
    );


    if (
      typeof imagem.close ===
      'function'
    ) {

      imagem.close();

    }


    /*
    |--------------------------------------------------------------------------
    | Linha separadora
    |--------------------------------------------------------------------------
    */

    const yRodape =
      altura;


    ctx.strokeStyle =
      '#c8c8c8';


    ctx.lineWidth =
      Math.max(
        1,
        Math.round(
          largura /
          1800
        )
      );


    ctx.beginPath();


    ctx.moveTo(
      0,
      yRodape + 0.5
    );


    ctx.lineTo(
      largura,
      yRodape + 0.5
    );


    ctx.stroke();


    /*
    |--------------------------------------------------------------------------
    | Texto
    |--------------------------------------------------------------------------
    */

    const texto =
      nomeSemExtensao(
        nomeArquivo
      );


    ctx.fillStyle =
      '#111111';


    ctx.textAlign =
      'center';


    ctx.textBaseline =
      'middle';


    let fonteAtual =
      tamanhoFonte;


    const larguraMaxima =
      largura -
      (
        paddingHorizontal *
        2
      );


    ctx.font =
      `600 ${fonteAtual}px Arial, Helvetica, sans-serif`;


    /*
     * Se o nome for muito grande,
     * reduz a fonte até caber.
     */
    while (

      fonteAtual >
      18

      &&

      ctx
        .measureText(
          texto
        )
        .width
        >
        larguraMaxima

    ) {

      fonteAtual -=
        2;


      ctx.font =
        `600 ${fonteAtual}px Arial, Helvetica, sans-serif`;

    }


    /*
    |--------------------------------------------------------------------------
    | Grava texto
    |--------------------------------------------------------------------------
    */

    ctx.fillText(

      texto,

      largura /
      2,

      altura +
      (
        alturaRodape /
        2
      ),

      larguraMaxima

    );


    /*
    |--------------------------------------------------------------------------
    | Retorna JPEG
    |--------------------------------------------------------------------------
    */

    return canvasParaBlob(

      canvas,

      opcoes.qualidade
      ??
      0.94

    );

  }


  /*
  |--------------------------------------------------------------------------
  | Download individual
  |--------------------------------------------------------------------------
  */

  async function baixarImagemComRodape(
    blobOriginal,
    nomeArquivo,
    opcoes = {}
  ) {

    const blobMarcado =
      await adicionarRodapeNome(

        blobOriginal,

        nomeArquivo,

        opcoes

      );


    const nomeBase =
      nomeSemExtensao(
        nomeArquivo
      );


    const url =
      URL.createObjectURL(
        blobMarcado
      );


    const a =
      document.createElement(
        'a'
      );


    a.href =
      url;


    a.download =
      `${nomeBase}.jpg`;


    document.body.appendChild(
      a
    );


    a.click();


    a.remove();


    setTimeout(
      () =>
        URL.revokeObjectURL(
          url
        ),
      1000
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Disponibiliza funções globalmente
  |--------------------------------------------------------------------------
  */

  window.adicionarRodapeNome =
    adicionarRodapeNome;


  window.baixarImagemComRodape =
    baixarImagemComRodape;


  window.nomeSemExtensaoImagem =
    nomeSemExtensao;

})();