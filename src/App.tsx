import { useState } from "react";
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import * as XLSX from "xlsx";

interface ProdutoCMV {
  produto: string;
  valorDeProduto: number;
  estoqueInicial: number;
  estoqueNecessario: number;
  compra: number;
  estoqueFinal: number;
  resultado: number;
  porcentagem: number;
}

function App() {
  const produtosSalvos = JSON.parse(localStorage.getItem("produto") || "[]");
  const [produto, setProduto] = useState<string>("");
  const [ValorDeProduto, setValorDeProduto] = useState<number>(0);
  const [valorEstoqueInicial, setValorEstoqueInicial] = useState<number>(0);
  const [valorEstoqueNecessario, setvalorEstoqueNecessario] = useState<number>(0);
  const [valorCompra, setValorCompra] = useState<number>(0);
  const [valorEstoqueFinal, setValorEstoqueFinal] = useState<number>(0);
  const [receitaDeVenda, setReceitaDeVenda] = useState<number>(0);

  const [produtosCMV, setProdutosCMV] = useState<ProdutoCMV[]>(
    produtosSalvos || []
  );

  const calcularCMV = () => {
    const resultado = valorEstoqueInicial + valorCompra - valorEstoqueFinal;

    const resultadoPercentual = (resultado / receitaDeVenda) * 100;
    const novoProduto: ProdutoCMV = {
      produto,
      valorDeProduto: ValorDeProduto,
      estoqueInicial: valorEstoqueInicial,
      estoqueNecessario: valorEstoqueNecessario,
      compra: valorCompra,
      estoqueFinal: valorEstoqueFinal,
      resultado,
      porcentagem: resultadoPercentual,
    };

    const produtosCalculadosCMV = [...produtosCMV, novoProduto];
    setProdutosCMV(produtosCalculadosCMV);
    localStorage.setItem("produto", JSON.stringify(produtosCalculadosCMV));
    // Resetar campos
    setProduto("");
    setValorDeProduto (0)
    setValorEstoqueInicial(0);
    setvalorEstoqueNecessario (0);
    setValorCompra(0);
    setReceitaDeVenda(0);
    setValorEstoqueFinal(0);
  };

  const exportarCSV = () => {
    const data = produtosCMV.map((p) => ({
      Produto: p.produto,
      "Valor do produto": p.valorDeProduto,
      "Estoque Inicial": p.estoqueInicial,
      "Estoque Necessario": p.estoqueNecessario,
      "Valor da Compra": p.compra,
      "Estoque Final": p.estoqueFinal,
      Resultado: p.resultado,
      "Porcentagem (%)": p.porcentagem.toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Cabeçalhos estilizados
    const headerStyle = {
      fill: {
        fgColor: { rgb: "1976D2" }, // Azul Material UI
      },
      font: {
        bold: true,
        color: { rgb: "FFFFFF" }, // Branco
      },
      alignment: {
        horizontal: "center",
      },
    };

    // Obter chaves do primeiro item para aplicar estilo no cabeçalho
    const headers = Object.keys(data[0]);
    headers.forEach((_header, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!worksheet[cellRef]) return;
      worksheet[cellRef].s = headerStyle;
    });

    // Ajustar largura das colunas
    worksheet["!cols"] = headers.map(() => ({ wch: 20 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CMV");
    XLSX.writeFile(workbook, "resultado.xlsx"); // .xlsx, não .csv
  };
  const deleteItem = (indexRemocao: number) => {
    const result = produtosCMV.filter(
      (_value, index) => index !== indexRemocao
    );

    setProdutosCMV(result);
    localStorage.setItem("produto", JSON.stringify(result));
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <TextField
        label="Produto"
        onChange={(e) => setProduto(e.target.value)}
        value={produto}
        sx={{ m: 1, width: "calc(100% - 16px)" }}
        
      />

      <TextField
        label="Valor do produto"
        onChange={(e) => setValorDeProduto(Number(e.target.value))}
        value={ValorDeProduto}
        sx={{ m: 1, width: "calc(100% - 16px)" }}
      />
        <TextField
        label="Estoque Inicial"
        type="number"
        onChange={(e) => setValorEstoqueInicial(Number(e.target.value))}
        value={valorEstoqueInicial}
        sx={{ m: 1, width: "calc(100% - 16px)" }}
      />
      <TextField
        label="Estoque Inicial"
        type="number"
        onChange={(e) => setvalorEstoqueNecessario(Number(e.target.value))}
        value={valorEstoqueInicial}
        sx={{ m: 1, width: "calc(100% - 16px)" }}
        />
      <TextField
        label="Valor da Compra"
        type="number"
        onChange={(e) => setValorCompra(Number(e.target.value))}
        value={valorCompra}
        sx={{ m: 1, width: "calc(100% - 16px)" }}
      />
      <TextField
        label="Estoque Final"
        type="number"
        onChange={(e) => setValorEstoqueFinal(Number(e.target.value))}
        value={valorEstoqueFinal}
        sx={{ m: 1, width: "calc(100% - 16px)" }}
      />
      <TextField
        label="Receita de venda"
        type="number"
        onChange={(e) => setReceitaDeVenda(Number(e.target.value))}
        value={receitaDeVenda}
        sx={{ m: 1, width: "calc(100% - 16px)" }}
      />
      <Button onClick={calcularCMV} variant="contained" sx={{ m: 1 }}>
        Adicionar Produto
      </Button>

      <>
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell align="right">Valor do produto</TableCell>
                <TableCell align="right">Estoque Inicial</TableCell>
                <TableCell align="right">Estoque Necessario</TableCell>
                <TableCell align="right">Compra</TableCell>
                <TableCell align="right">Estoque Final</TableCell>
                <TableCell align="right">Resultado</TableCell>
                <TableCell align="right">Porcentagem (%)</TableCell>
                <TableCell align="right">Acoes </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {produtosCMV.length > 0 &&
                produtosCMV.map((p, index) => (
                  <TableRow key={index}>
                    <TableCell>{p.produto}</TableCell>
                    <TableCell align="right">{p.valorDeProduto}</TableCell>
                    <TableCell align="right">{p.estoqueInicial}</TableCell>
                    <TableCell align="right">{p.estoqueNecessario}</TableCell>
                    <TableCell align="right">{p.compra}</TableCell>
                    <TableCell align="right">{p.estoqueFinal}</TableCell>
                    <TableCell align="right">{p.resultado}</TableCell>
                    <TableCell align="right">
                      {p.porcentagem?.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      <Button onClick={() => deleteItem(index)}>Excluir</Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button onClick={exportarCSV} variant="outlined" sx={{ mt: 2 }}>
          Exportar CSV
        </Button>
      </>
    </div>
  );
}

export default App;
