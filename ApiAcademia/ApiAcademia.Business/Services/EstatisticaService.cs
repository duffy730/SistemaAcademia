using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Repository.Data;
using ApiAcademia.Repository.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace ApiAcademia.Business.Services;

public interface IEstatisticaService
{
    EstatisticaResponseDTO ObterEstatisticas();
}

public class EstatisticaService : IEstatisticaService
{
    private readonly AppDbContext _context;

    public EstatisticaService(AppDbContext context)
    {
        _context = context;
    }

    public EstatisticaResponseDTO ObterEstatisticas()
    {
        var alunosAtivos = _context.Matriculas
            .Where(m => m.Ativa)
            .Select(m => m.AlunoId)
            .Distinct()
            .Count();

        var matriculasAtivas = _context.Matriculas
            .Count();

        var faturamento = _context.Pagamentos
            .Sum(p => p.Valor);

        return new EstatisticaResponseDTO
        {
            AlunosAtivos = alunosAtivos,
            QtdMatriculas = matriculasAtivas,
            Faturamento = faturamento
        };
    }
    
}
