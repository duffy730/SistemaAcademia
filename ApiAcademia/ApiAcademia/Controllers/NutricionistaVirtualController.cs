using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
public class NutricionistaVirtualController : ControllerBase
{
    private readonly IAlunoService _service;
    public NutricionistaVirtualController(IAlunoService service)
    {
        _service = service;
    }

    [Authorize(Roles = "Admin, Nutri")]
    [HttpGet("calcular-imc/{id}")]
    public IActionResult CalcularImc(int id)
    {
        var resultado = _service.ObterImcAluno(id);

        if (resultado == null)
            return NotFound(new { messagem = "Aluno não encontrado." });

        return Ok(resultado);
    }
}
