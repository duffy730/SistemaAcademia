using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/estatistica")]
public class EstatisticaController : ControllerBase
{
    private readonly IEstatisticaService _estatisticaService;

    public EstatisticaController(IEstatisticaService estatisticaService)
    {
        _estatisticaService = estatisticaService;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("listar-dados")]
    public IActionResult ObterEstatisticas()
    {
        var resultado = _estatisticaService.ObterEstatisticas();

        return Ok(resultado);
    }
}
