using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/exercicios")]
public class ExercicioController : ControllerBase
{
    private readonly IExercicioService _service;

    public ExercicioController(IExercicioService service)
    {
        _service = service;
    }

    [Authorize(Roles = "Admin, Nutri, Recepcionista")]
    [HttpGet("listar")]
    public IActionResult Listar()
    {
        var exercicios = _service.Listar();

        return Ok(exercicios);


    }

    [Authorize(Roles = "Admin, Nutri, Recepcionista")]
    [HttpGet("buscar-id/{id}")]
    public IActionResult BuscarPorId(int id)
    {
        var exercicio = _service.BuscarPorId(id);

        if (exercicio == null)
            return NotFound(new { messagem = "Exercício não encontrado." });

        return Ok(exercicio);
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPost("criar-exercicio")]
    public IActionResult Criar([FromBody] CriarExercicioDTO dto)
    {
        _service.Criar(dto);

        return Ok("Exercício criado com sucesso");
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPut("atualizar-exercicio/{id}")]
    public IActionResult Atualizar(int id, [FromBody] CriarExercicioDTO dto)
    {
        var atualizar = _service.Atualizar(id, dto);

        if (!atualizar)
            return NotFound(new { messagem = "Exercício não encontrado." });

        return Ok("Exercício atualizado com sucesso");
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpDelete("remover-exercicio/{id}")]
    public IActionResult Remover(int id)
    {
        var removido = _service.Remover(id);

        if (!removido)
        {
            return NotFound(new
            {
                mensagem = "Exercício não encontrado"
            });
        }

        return Ok(new
        {
            mensagem = "Exercício removido com sucesso"
        });
    }
}
