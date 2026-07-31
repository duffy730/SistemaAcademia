using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Repository.Entities;
using ApiAcademia.Business.DTOs;
using ApiAcademia.Repository.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.Services;

public interface IAlunoService
{
    List<AlunoResponseDTO> listaAluno();
    AlunoResponseDTO BuscarPorId(int id);
    void Criar(CriarAlunoDTO aluno);
    bool Atualizar(int id, CriarAlunoDTO aluno);
    bool Remover(int id);
    AlunoImcResponseDTO ObterImcAluno(int id);
}

public class AlunoService : IAlunoService
{

    private readonly IAlunoRepository _alunoRepository;

    public AlunoService(IAlunoRepository alunoRepository)
    {
        _alunoRepository = alunoRepository;
    }

    public List<AlunoResponseDTO> listaAluno()
    {
        var alunos = _alunoRepository.Listar();

        return alunos.Select(aluno => new AlunoResponseDTO
        {
            Id = aluno.Id,
            Nome = aluno.Nome,
            Peso = aluno.Peso,
            Altura = aluno.Altura,
            Email = aluno.Email,
            Telefone = aluno.Telefone,
            Cpf = aluno.Cpf,
            Idade = DateTime.Today.Year - aluno.DataNascimento.Year,
            DataNascimento = aluno.DataNascimento
        }).ToList();
    }

    public AlunoResponseDTO BuscarPorId(int id)
    {
        var aluno = _alunoRepository.BuscarPorId(id);
        if (aluno == null)
        {
            return null;
        }

        return new AlunoResponseDTO
        {
            Id = aluno.Id,
            Nome = aluno.Nome,
            Email = aluno.Email,
        };
    }

    public void Criar(CriarAlunoDTO dto)
    {
        if (string.IsNullOrEmpty(dto.Nome))
            throw new Exception("Nome do aluno é obrigatório");

        if (string.IsNullOrEmpty(dto.Email))
            throw new Exception("Email do aluno é obrigatório");

        var novoAluno = new AlunoEntitie
        {
            Nome = dto.Nome,
            Cpf = dto.Cpf,
            Peso = dto.Peso,
            Altura = dto.Altura,
            Email = dto.Email,
            Telefone = dto.Telefone,
            DataNascimento = dto.DataNascimento
        };

        _alunoRepository.Adicionar(novoAluno);
    }

    public bool Atualizar(int id, CriarAlunoDTO dto)
    {
        var alunoExistente = _alunoRepository.BuscarPorId(id);
        if (alunoExistente == null)
        {
            return false;
        }
        alunoExistente.Nome = dto.Nome;
        alunoExistente.Cpf = dto.Cpf;
        alunoExistente.Peso = dto.Peso;
        alunoExistente.Altura = dto.Altura;
        alunoExistente.Email = dto.Email;
        alunoExistente.Telefone = dto.Telefone;
        alunoExistente.DataNascimento = dto.DataNascimento;

        _alunoRepository.Atualizar(alunoExistente);
        return true;
    }

    public bool Remover(int id)
    {
        var aluno = _alunoRepository.BuscarPorId(id);
        if (aluno == null)
        {
            return false;
        }
        _alunoRepository.Remover(id);

        return true;
    }

    public int GerarId()
    {
        var alunos = _alunoRepository.Listar();

        if (!alunos.Any())
            return 1;

        return alunos.Max(a => a.Id) + 1;
    }


    public AlunoImcResponseDTO ObterImcAluno(int id)
    {
        var aluno = _alunoRepository.BuscarPorId(id);

        if (aluno == null)
            return null;

        var imc = aluno.Peso / (aluno.Altura * aluno.Altura);
        var classificacão = "";

        if (imc < 17)
        {
            classificacão = "Muito abaixo do peso";
        }
        else if (imc < 18.5)
        {
            classificacão = "Abaixo do peso";
        }
        else if (imc < 25)
        {
            classificacão = "Peso normal";
        }
        else if (imc < 30)
        {
            classificacão = "Acima do peso";
        }
        else if (imc < 35)
        {
            classificacão = "Obesidade I";
        }
        else if (imc < 40)
        {
            classificacão = "Obesidade II (severa)";
        }
        else
        {
            classificacão = "Obesidade III (mórbida)";
        }

        return new AlunoImcResponseDTO
        {
            Nome = aluno.Nome,
            Peso = aluno.Peso,
            Altura = aluno.Altura,
            Imc = Math.Round(imc, 2),
            Classificacao = classificacão
        };
    }
}
