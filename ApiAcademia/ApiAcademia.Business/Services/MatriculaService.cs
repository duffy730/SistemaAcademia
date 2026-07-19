using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Repository.Entities;
using ApiAcademia.Repository.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.Services;

public interface IMatriculaService
{
    List<MatriculaResponseDTO> listaMatricula();
    MatriculaResponseDTO BuscarPorId(int id);
    bool Criar(CriarMatriculaDTO matricula);
    void Atualizar(int id, CriarMatriculaDTO dto);
    bool Ativar(int id);
    bool Desativar(int id);
    void Remover(int id);
}

public class MatriculaService : IMatriculaService
{
    private readonly IMatriculaRepository _matriculaRepository;
    private readonly IPlanoRepository _planoRepository;
    private readonly IPagamentoRepository _pagamentoRepository;

    public MatriculaService(
        IMatriculaRepository matriculaRepository,
        IPlanoRepository planoRepository,
        IPagamentoRepository pagamentoRepository)
    {
        _matriculaRepository = matriculaRepository;
        _planoRepository = planoRepository;
        _pagamentoRepository = pagamentoRepository;
    }

    public MatriculaService(IMatriculaRepository matriculaRepository)
    {
        _matriculaRepository = matriculaRepository;
    }

    public List<MatriculaResponseDTO> listaMatricula()
    {
        var matriculas =
        _matriculaRepository.Listar();

        return matriculas
            .Select(matricula =>
            {
                var temPagamentoPendente =
                    _pagamentoRepository
                        .ExistePagamentoPendente(
                            matricula.Id
                        );

                var status = !matricula.Ativa
                    ? "Inativa"
                    : temPagamentoPendente
                        ? "Pendente"
                        : "Ativa";

                return new MatriculaResponseDTO
                {
                    Id = matricula.Id,

                    AlunoId = matricula.AlunoId,

                    PlanoId = matricula.PlanoId,

                    Aluno =
                        matricula.Aluno?.Nome ??
                        "Aluno não encontrado",

                    Plano =
                        matricula.Plano?.Nome,

                    Ativa = matricula.Ativa,

                    Descricao =
                        matricula.Descricao,

                    TemPagamentoPendente =
                        temPagamentoPendente,

                    Status = status
                };
            })
            .ToList();
    }

    public MatriculaResponseDTO BuscarPorId(int id)
    {
        var matricula = _matriculaRepository.BuscarPorId(id);
        if (matricula == null)
        {
            return null;
        }
        return new MatriculaResponseDTO
        {
            Id = matricula.Id,
            Aluno = matricula.Aluno.Nome,
            Plano = matricula.Plano.Nome,
            Ativa = matricula.Ativa,
            Descricao = matricula.Descricao
        };
    }

    public bool Criar(CriarMatriculaDTO dto)
    {
        if (dto.PlanoId <= 0 || dto.AlunoId <= 0)
        {
            return false;
        }
        

        var matricula = new MatriculaEntitie
        {
            AlunoId = dto.AlunoId,
            PlanoId = dto.PlanoId,
            Ativa = true,
            Descricao = $"Matrícula ativada em {DateTime.Now:dd/MM/yyyy}"
        };
        _matriculaRepository.Adicionar(matricula);

        var plano = _planoRepository.BuscarPorId(dto.PlanoId);

        if (plano == null)
        {
            throw new Exception("Plano não encontrado.");
        }

        var pagamentoPendente = new PagamentoEntitie
        {
            MatriculaId = matricula.Id,
            ProdutoId = null,
            Quantidade = 0,

            Descricao =
                $"Mensalidade pendente - {plano.Nome}",

            Valor = plano.Valor,

            MetodoPagamento = "Não informado",

            DataPagamento = DateOnly.FromDateTime(
                DateTime.Today
            ),

            Status = "Pendente"
        };

        _pagamentoRepository.AdicionarComBaixaEstoque(
            pagamentoPendente
        );
        return true;
    }

    public void Atualizar(int id, CriarMatriculaDTO dto)
    {
        var matricula = _matriculaRepository.BuscarPorId(id);
        if (matricula == null)
        {
            throw new Exception("Matrícula não encontrada.");
        }
        matricula.AlunoId = dto.AlunoId;
        matricula.PlanoId = dto.PlanoId;

        _matriculaRepository.Atualizar(matricula);
    }

    public bool Ativar(int id)
    {
        var matricula = _matriculaRepository.BuscarPorId(id);

        if (matricula == null)
            return false;

        _matriculaRepository.Ativar(id);
        return true;
    }

    public bool Desativar(int id)
    {
        var matricula = _matriculaRepository.BuscarPorId(id);

        if (matricula == null)
            return false;

        _matriculaRepository.Desativar(id);
        return true;
    }

    public void Remover(int id)
    {
        var matricula = _matriculaRepository.BuscarPorId(id);
        if (matricula == null)
            throw new Exception("Matrícula não encontrada");
        _matriculaRepository.Remover(id);
    }

    public int GerarId()
    {
        var matriculas = _matriculaRepository.Listar();

        if (!matriculas.Any())
            return 1;

        return matriculas.Max(a => a.Id) + 1;
    }
}
