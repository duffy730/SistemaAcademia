using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AcademiaAPI.Principal.Controllers;

[ApiController]
[Route("api/alunos")]
public class AlunoController : ControllerBase
{
    private readonly IAlunoService _service;

    public AlunoController(IAlunoService service)
    {
        _service = service;
    }

    [Authorize(Roles = "Admin, Nutri, Recepcionista")]
    [HttpGet("listar")]
    public IActionResult Listar()
    {
        var alunos = _service.listaAluno();

        return Ok(alunos);

        
    }

    [Authorize(Roles = "Admin, Nutri, Recepcionista")]
    [HttpGet("buscar-id/{id}")]
    public IActionResult BuscarPorId(int id)
    {
        var aluno = _service.BuscarPorId(id);

        if (aluno == null)
            return NotFound(new { messagem = "Aluno não encontrado." });

        return Ok(aluno);
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPost("criar-aluno")]
    public IActionResult Criar([FromBody] CriarAlunoDTO dto)
    {
        _service.Criar(dto);

        return Ok("Aluno criado com sucesso");
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPut("atualizar-aluno/{id}")]
    public IActionResult Atualizar(int id, [FromBody] CriarAlunoDTO dto)
    {
        var atualizar = _service.Atualizar(id, dto);

        if (!atualizar)
            return NotFound(new { messagem = "Aluno não encontrado." });

        return Ok("Aluno atualizado com sucesso");
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpDelete("remover-aluno/{id}")]
    public IActionResult Remover(int id)
    {
        var removido =_service.Remover(id);

        if (!removido)
        {
            return NotFound(new
            {
                mensagem = "Aluno não encontrado"
            });
        }

        return Ok(new
        {
            mensagem = "Aluno removido com sucesso"
        });
    }
}