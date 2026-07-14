using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Controllers;


[ApiController]
[Route("api/matriculas")]
public class MatriculaController : ControllerBase
{
    private readonly IMatriculaService _service;

    public MatriculaController(IMatriculaService service)
    {
        _service = service;
    }

    [Authorize]
    [HttpGet("listar")]
    public IActionResult Listar()
    {
        var matriculas = _service.listaMatricula();

        return Ok(matriculas);
    }

    [Authorize]
    [HttpGet("buscar-id/{id}")]
    public IActionResult BuscarPorId(int id)
    {
        var matricula = _service.BuscarPorId(id);

        if (matricula == null)
            return NotFound(new { messagem = "Aluno não encontrado." });

        return Ok(matricula);
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPost("criar-matricula")]
    public IActionResult Criar([FromBody] CriarMatriculaDTO dto)
    {
        var criar = _service.Criar(dto);

        if (!criar)
        {
            return NotFound(new
            {
                mensagem = "PlanoId ou AlunoId inválido"
            });
        }

        return Ok(new
        {
            mensagem = "Matrícula criada com sucesso"
        });

    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPut("atualizar-matricula/{id}")]
    public IActionResult Atualizar(int id, [FromBody] CriarMatriculaDTO dto)
    {
        var matriculaExistente = _service.BuscarPorId(id);

        if (matriculaExistente == null)
            return NotFound(new { messagem = "Matrícula não encontrada." });

        _service.Atualizar(id, dto);

        return Ok(new {mensagem = "Matrícula atualizada com sucesso"});
      ;
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPut("ativar/{id}")]
    public IActionResult Ativar(int id)
    {
        var ativar = _service.Ativar(id);

        if (!ativar)
        {
            return NotFound(new
            {
                mensagem = "Matrícula não encontrada"
            });
        }

        return Ok(new
        {
            mensagem = "Matrícula ativada com sucesso"
        });
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPut("desativar/{id}")]
    public IActionResult Desativar(int id)
    {
        var desativar = _service.Desativar(id);

        if (!desativar)
        {
            return NotFound(new
            {
                mensagem = "Matrícula não encontrada"
            });
        }

        return Ok(new
        {
            mensagem = "Matrícula desativada com sucesso"
        });
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpDelete("remover/{id}")]
    public IActionResult Remover(int id)
    {
        _service.Remover(id);
        return Ok("Matrícula removida com sucesso");
    }
}

