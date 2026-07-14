using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Principal.Controllers;

[ApiController]
[Route("api/planos")]
public class PlanoController : ControllerBase
{
    private readonly IPlanoService _service;

    public PlanoController(IPlanoService service)
    {
        _service = service;
    }

    [HttpGet("listar")]
    public IActionResult Listar()
    {
        var planos = _service.listaPlano();

        return Ok(planos);
    }

    [HttpGet("buscar-id/{id}")]
    public IActionResult BuscarPorId(int id)
    {
        var plano = _service.BuscarPorId(id);

        if (plano == null)
            return NotFound(new { messagem = "Plano não encontrado." });

        return Ok(plano);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("criar")]
    public IActionResult Criar([FromBody] CriarPlanoDTO dto)
    {
        _service.Criar(dto);

        return Ok("Plano criado com sucesso");
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("deletar/{id}")]
    public IActionResult Remover(int id)
    {
        var removido = _service.Remover(id);

        if(!removido)
        {
            return NotFound(new
            {
                mensagem = "Plano não encontrado"
            });
        }

        return Ok(new
        {
            mensagem = "Plano removido com sucesso"
        });

    }
}