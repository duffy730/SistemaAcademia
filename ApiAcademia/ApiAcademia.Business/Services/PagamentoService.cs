using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Repository.Entities;
using ApiAcademia.Repository.Repository;

namespace ApiAcademia.Business.Services;

public interface IPagamentoService
{
    List<PagamentoResponseDTO> listaPagamento();

    PagamentoResponseDTO? BuscarPorId(int id);

    bool Criar(CriarPagamentoDTO pagamento);

    bool Atualizar(int id, CriarPagamentoDTO pagamento);

    bool Remover(int id);
}

public class PagamentoService : IPagamentoService
{
    private readonly IPagamentoRepository _pagamentoRepository;
    private readonly IMatriculaRepository _matriculaRepository;

    public PagamentoService(
        IPagamentoRepository pagamentoRepository,
        IMatriculaRepository matriculaRepository,
        IProdutosRepository produtoRepository)
    {
        _pagamentoRepository = pagamentoRepository;
        _matriculaRepository = matriculaRepository;
    }

    public List<PagamentoResponseDTO> listaPagamento()
    {
        var pagamentos = _pagamentoRepository.Listar();

        return pagamentos
            .Select(pagamento => new PagamentoResponseDTO
            {
                Id = pagamento.Id,
                MatriculaId = pagamento.MatriculaId,
                ProdutoId = pagamento.ProdutoId,
                Quantidade = pagamento.Quantidade,
                Descricao = pagamento.Descricao,
                Valor = pagamento.Valor,
                DataPagamento = pagamento.DataPagamento,
                MetodoPagamento = pagamento.MetodoPagamento
            })
            .ToList();
    }

    public PagamentoResponseDTO? BuscarPorId(int id)
    {
        var pagamento =
            _pagamentoRepository.BuscarPorId(id);

        if (pagamento == null)
        {
            return null;
        }

        return new PagamentoResponseDTO
        {
            Id = pagamento.Id,
            MatriculaId = pagamento.MatriculaId,
            ProdutoId = pagamento.ProdutoId,
            Quantidade = pagamento.Quantidade,
            Descricao = pagamento.Descricao,
            Valor = pagamento.Valor,
            DataPagamento = pagamento.DataPagamento,
            MetodoPagamento = pagamento.MetodoPagamento
        };
    }

    public bool Criar(CriarPagamentoDTO dto)
    {
        var matricula =
            _matriculaRepository.BuscarPorId(
                dto.MatriculaId
            );

        if (matricula == null)
        {
            throw new Exception(
                "Matrícula não encontrada."
            );
        }

        if (
            dto.ProdutoId.HasValue &&
            dto.Quantidade <= 0
        )
        {
            throw new Exception(
                "A quantidade precisa ser maior que zero."
            );
        }

        if (
            !dto.ProdutoId.HasValue &&
            dto.Valor <= 0
        )
        {
            throw new Exception(
                "O valor precisa ser maior que zero."
            );
        }

        var pagamento = new PagamentoEntitie
        {
            MatriculaId = dto.MatriculaId,
            ProdutoId = dto.ProdutoId,

            Quantidade = dto.ProdutoId.HasValue
                ? dto.Quantidade
                : 0,

            Descricao =
                string.IsNullOrWhiteSpace(dto.Descricao)
                    ? dto.ProdutoId.HasValue
                        ? "Venda de produto"
                        : "Pagamento de plano"
                    : dto.Descricao.Trim(),

            Valor = dto.Valor,

            MetodoPagamento =
                dto.MetodoPagamento,

            DataPagamento =
                DateOnly.FromDateTime(
                    dto.DataPagamento
                )
        };

        var resultado =
            _pagamentoRepository
                .AdicionarComBaixaEstoque(pagamento);

        if (!resultado)
        {
            throw new Exception(
                "Produto inexistente, quantidade inválida ou estoque insuficiente."
            );
        }

        return true;
    }

    public bool Atualizar(
        int id,
        CriarPagamentoDTO dto)
    {
        if (id <= 0)
        {
            return false;
        }

        var matricula =
            _matriculaRepository.BuscarPorId(
                dto.MatriculaId
            );

        if (matricula == null)
        {
            throw new Exception(
                "Matrícula não encontrada."
            );
        }

        if (
            dto.ProdutoId.HasValue &&
            dto.Quantidade <= 0
        )
        {
            throw new Exception(
                "A quantidade precisa ser maior que zero."
            );
        }

        if (
            !dto.ProdutoId.HasValue &&
            dto.Valor <= 0
        )
        {
            throw new Exception(
                "O valor precisa ser maior que zero."
            );
        }

        var pagamento = new PagamentoEntitie
        {
            Id = id,
            MatriculaId = dto.MatriculaId,
            ProdutoId = dto.ProdutoId,

            Quantidade = dto.ProdutoId.HasValue
                ? dto.Quantidade
                : 0,

            Descricao = dto.Descricao?.Trim()
                ?? string.Empty,

            Valor = dto.Valor,
            MetodoPagamento = dto.MetodoPagamento,

            DataPagamento = DateOnly.FromDateTime(
                dto.DataPagamento
            )
        };

        return _pagamentoRepository
            .AtualizarComAjusteEstoque(
                id,
                pagamento
            );
    }

    public bool Remover(int id)
    {
        if (id <= 0)
        {
            return false;
        }

        return _pagamentoRepository
            .RemoverComDevolucaoEstoque(id);
    }

    public int GerarId()
    {
        var pagamentos =
            _pagamentoRepository.Listar();

        if (!pagamentos.Any())
        {
            return 1;
        }

        return pagamentos.Max(
            pagamento => pagamento.Id
        ) + 1;
    }
}