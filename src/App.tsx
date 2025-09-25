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
  Typography,
  Box,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  FileDownload as DownloadIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
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
  const [valorEstoqueNecessario, setvalorEstoqueNecessario] =
    useState<number>(0);
  const [valorCompra, setValorCompra] = useState<number>(0);
  const [valorEstoqueFinal, setValorEstoqueFinal] = useState<number>(0);
  const [receitaDeVenda, setReceitaDeVenda] = useState<number>(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);

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
    setValorDeProduto(0);
    setValorEstoqueInicial(0);
    setvalorEstoqueNecessario(0);
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

  const editItem = (index: number) => {
    const produto = produtosCMV[index];
    setProduto(produto.produto);
    setValorDeProduto(produto.valorDeProduto);
    setValorEstoqueInicial(produto.estoqueInicial);
    setvalorEstoqueNecessario(produto.estoqueNecessario);
    setValorCompra(produto.compra);
    setValorEstoqueFinal(produto.estoqueFinal);
    setReceitaDeVenda(produto.resultado / (produto.porcentagem / 100));
    setEditingIndex(index);
    setOpenEditDialog(true);
  };

  const salvarEdicao = () => {
    if (editingIndex !== null) {
      const resultado = valorEstoqueInicial + valorCompra - valorEstoqueFinal;
      const resultadoPercentual = (resultado / receitaDeVenda) * 100;

      const produtoEditado: ProdutoCMV = {
        produto,
        valorDeProduto: ValorDeProduto,
        estoqueInicial: valorEstoqueInicial,
        estoqueNecessario: valorEstoqueNecessario,
        compra: valorCompra,
        estoqueFinal: valorEstoqueFinal,
        resultado,
        porcentagem: resultadoPercentual,
      };

      const novosProdutos = [...produtosCMV];
      novosProdutos[editingIndex] = produtoEditado;
      setProdutosCMV(novosProdutos);
      localStorage.setItem("produto", JSON.stringify(novosProdutos));

      // Resetar campos
      setProduto("");
      setValorDeProduto(0);
      setValorEstoqueInicial(0);
      setvalorEstoqueNecessario(0);
      setValorCompra(0);
      setReceitaDeVenda(0);
      setValorEstoqueFinal(0);
      setEditingIndex(null);
      setOpenEditDialog(false);
    }
  };

  const cancelarEdicao = () => {
    setProduto("");
    setValorDeProduto(0);
    setValorEstoqueInicial(0);
    setvalorEstoqueNecessario(0);
    setValorCompra(0);
    setReceitaDeVenda(0);
    setValorEstoqueFinal(0);
    setEditingIndex(null);
    setOpenEditDialog(false);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Cabeçalho */}
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            Sistema CMV - Custo da Mercadoria Vendida
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Formulário */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "#1976d2", fontWeight: "bold", mb: 3 }}
            >
              Adicionar Novo Produto
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                <TextField
                  label="Nome do Produto"
                  onChange={(e) => setProduto(e.target.value)}
                  value={produto}
                  fullWidth
                  variant="outlined"
                />
              </Box>

              <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                <TextField
                  label="Valor do Produto"
                  type="number"
                  onChange={(e) => setValorDeProduto(Number(e.target.value))}
                  value={ValorDeProduto}
                  fullWidth
                  variant="outlined"
                />
              </Box>

              <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                <TextField
                  label="Estoque Inicial"
                  type="number"
                  onChange={(e) =>
                    setValorEstoqueInicial(Number(e.target.value))
                  }
                  value={valorEstoqueInicial}
                  fullWidth
                  variant="outlined"
                />
              </Box>

              <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                <TextField
                  label="Estoque Necessário"
                  type="number"
                  onChange={(e) =>
                    setvalorEstoqueNecessario(Number(e.target.value))
                  }
                  value={valorEstoqueNecessario}
                  fullWidth
                  variant="outlined"
                />
              </Box>

              <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                <TextField
                  label="Valor da Compra"
                  type="number"
                  onChange={(e) => setValorCompra(Number(e.target.value))}
                  value={valorCompra}
                  fullWidth
                  variant="outlined"
                />
              </Box>

              <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                <TextField
                  label="Estoque Final"
                  type="number"
                  onChange={(e) => setValorEstoqueFinal(Number(e.target.value))}
                  value={valorEstoqueFinal}
                  fullWidth
                  variant="outlined"
                />
              </Box>

              <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                <TextField
                  label="Receita de Venda"
                  type="number"
                  onChange={(e) => setReceitaDeVenda(Number(e.target.value))}
                  value={receitaDeVenda}
                  fullWidth
                  variant="outlined"
                />
              </Box>

              <Box
                sx={{
                  flex: "1 1 300px",
                  minWidth: "300px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Button
                  onClick={calcularCMV}
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  sx={{
                    backgroundColor: "#1976d2",
                    "&:hover": { backgroundColor: "#1565c0" },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Adicionar Produto
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tabela de Resultados */}
        {produtosCMV.length > 0 && (
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "#1976d2", fontWeight: "bold" }}
                >
                  Produtos Cadastrados ({produtosCMV.length})
                </Typography>
                <Button
                  onClick={exportarCSV}
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    "&:hover": {
                      borderColor: "#1565c0",
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  Exportar Excel
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>
                        Produto
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", color: "#1976d2" }}
                      >
                        Valor do Produto
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", color: "#1976d2" }}
                      >
                        Estoque Inicial
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", color: "#1976d2" }}
                      >
                        Estoque Necessário
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", color: "#1976d2" }}
                      >
                        Compra
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", color: "#1976d2" }}
                      >
                        Estoque Final
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", color: "#1976d2" }}
                      >
                        Resultado
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", color: "#1976d2" }}
                      >
                        Porcentagem (%)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold", color: "#1976d2" }}
                      >
                        Ações
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {produtosCMV.map((p, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                          "&:hover": { backgroundColor: "#e3f2fd" },
                        }}
                      >
                        <TableCell sx={{ fontWeight: "medium" }}>
                          {p.produto || "-"}
                        </TableCell>
                        <TableCell align="right">
                          R$ {(p.valorDeProduto || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          R$ {(p.estoqueInicial || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          R$ {(p.estoqueNecessario || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          R$ {(p.compra || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          R$ {(p.estoqueFinal || 0).toFixed(2)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: "bold",
                            color:
                              (p.resultado || 0) >= 0 ? "#2e7d32" : "#d32f2f",
                          }}
                        >
                          R$ {(p.resultado || 0).toFixed(2)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: "bold",
                            color:
                              (p.porcentagem || 0) >= 0 ? "#2e7d32" : "#d32f2f",
                          }}
                        >
                          {(p.porcentagem || 0).toFixed(2)}%
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "center",
                            }}
                          >
                            <IconButton
                              onClick={() => editItem(index)}
                              color="primary"
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                                },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => deleteItem(index)}
                              color="error"
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Modal de Edição */}
      <Dialog
        open={openEditDialog}
        onClose={cancelarEdicao}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar Produto</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 2 }}>
            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <TextField
                label="Nome do Produto"
                onChange={(e) => setProduto(e.target.value)}
                value={produto}
                fullWidth
                variant="outlined"
              />
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <TextField
                label="Valor do Produto"
                type="number"
                onChange={(e) => setValorDeProduto(Number(e.target.value))}
                value={ValorDeProduto}
                fullWidth
                variant="outlined"
              />
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <TextField
                label="Estoque Inicial"
                type="number"
                onChange={(e) => setValorEstoqueInicial(Number(e.target.value))}
                value={valorEstoqueInicial}
                fullWidth
                variant="outlined"
              />
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <TextField
                label="Estoque Necessário"
                type="number"
                onChange={(e) =>
                  setvalorEstoqueNecessario(Number(e.target.value))
                }
                value={valorEstoqueNecessario}
                fullWidth
                variant="outlined"
              />
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <TextField
                label="Valor da Compra"
                type="number"
                onChange={(e) => setValorCompra(Number(e.target.value))}
                value={valorCompra}
                fullWidth
                variant="outlined"
              />
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <TextField
                label="Estoque Final"
                type="number"
                onChange={(e) => setValorEstoqueFinal(Number(e.target.value))}
                value={valorEstoqueFinal}
                fullWidth
                variant="outlined"
              />
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <TextField
                label="Receita de Venda"
                type="number"
                onChange={(e) => setReceitaDeVenda(Number(e.target.value))}
                value={receitaDeVenda}
                fullWidth
                variant="outlined"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelarEdicao} color="secondary">
            Cancelar
          </Button>
          <Button onClick={salvarEdicao} variant="contained" color="primary">
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
