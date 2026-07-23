using ApiAcademia.Repository.Data;
using ApiAcademia.Repository.Entities;
using Microsoft.EntityFrameworkCore;

namespace ApiAcademia.Repository.Repository;

public interface INutricaoRepository
{
    List<PlanoNutricaoEntitie> Listar();

    PlanoNutricaoEntitie? BuscarPorId(int id);

    PlanoNutricaoEntitie? BuscarAtivoPorAluno(int alunoId);

    bool AlunoExiste(int alunoId);

    PlanoNutricaoEntitie Criar(PlanoNutricaoEntitie plano);

    bool Atualizar(int id, PlanoNutricaoEntitie novosDados);

    bool Remover(int id);

    MedidaCorporalEntitie? AdicionarMedida(
        int planoId,
        MedidaCorporalEntitie medida
    );
}

public class NutricaoRepository : INutricaoRepository
{
    private readonly AppDbContext _context;

    public NutricaoRepository(AppDbContext context)
    {
        _context = context;
    }

    public List<PlanoNutricaoEntitie> Listar()
    {
        return ConsultaCompleta()
            .AsNoTracking()
            .OrderByDescending(plano => plano.DataInicio)
            .ToList();
    }

    public PlanoNutricaoEntitie? BuscarPorId(int id)
    {
        return ConsultaCompleta()
            .AsNoTracking()
            .FirstOrDefault(plano => plano.Id == id);
    }

    public PlanoNutricaoEntitie? BuscarAtivoPorAluno(int alunoId)
    {
        return ConsultaCompleta()
            .AsNoTracking()
            .FirstOrDefault(
                plano => plano.AlunoId == alunoId && plano.Ativo
            );
    }

    public bool AlunoExiste(int alunoId)
    {
        return _context.Alunos
            .AsNoTracking()
            .Any(aluno => aluno.Id == alunoId);
    }

    public PlanoNutricaoEntitie Criar(PlanoNutricaoEntitie plano)
    {
        using var transacao = _context.Database.BeginTransaction();

        try
        {
            var planosAtivos = _context.PlanosNutricao
                .Where(
                    item => item.AlunoId == plano.AlunoId && item.Ativo
                )
                .ToList();

            foreach (var planoAtivo in planosAtivos)
            {
                planoAtivo.Ativo = false;
            }

            _context.PlanosNutricao.Add(plano);
            _context.SaveChanges();

            transacao.Commit();

            return BuscarPorId(plano.Id)!;
        }
        catch
        {
            transacao.Rollback();
            throw;
        }
    }

    public bool Atualizar(int id, PlanoNutricaoEntitie novosDados)
    {
        using var transacao = _context.Database.BeginTransaction();

        try
        {
            var planoExistente = _context.PlanosNutricao
                .Include(plano => plano.Refeicoes)
                .Include(plano => plano.Suplementos)
                .FirstOrDefault(plano => plano.Id == id);

            if (planoExistente == null)
            {
                return false;
            }

            planoExistente.DataInicio = novosDados.DataInicio;
            planoExistente.CaloriasMeta = novosDados.CaloriasMeta;
            planoExistente.ProteinasMeta = novosDados.ProteinasMeta;
            planoExistente.CarboidratosMeta = novosDados.CarboidratosMeta;
            planoExistente.GordurasMeta = novosDados.GordurasMeta;
            planoExistente.AguaMetaLitros = novosDados.AguaMetaLitros;
            planoExistente.Observacoes = novosDados.Observacoes;
            planoExistente.Ativo = true;

            _context.RefeicoesNutricao.RemoveRange(
                planoExistente.Refeicoes
            );

            _context.SuplementosNutricao.RemoveRange(
                planoExistente.Suplementos
            );

            foreach (var refeicao in novosDados.Refeicoes)
            {
                refeicao.PlanoNutricaoId = id;
            }

            foreach (var suplemento in novosDados.Suplementos)
            {
                suplemento.PlanoNutricaoId = id;
            }

            _context.RefeicoesNutricao.AddRange(
                novosDados.Refeicoes
            );

            _context.SuplementosNutricao.AddRange(
                novosDados.Suplementos
            );

            _context.SaveChanges();
            transacao.Commit();

            return true;
        }
        catch
        {
            transacao.Rollback();
            throw;
        }
    }

    public bool Remover(int id)
    {
        var plano = _context.PlanosNutricao
            .FirstOrDefault(item => item.Id == id);

        if (plano == null)
        {
            return false;
        }

        _context.PlanosNutricao.Remove(plano);
        _context.SaveChanges();

        return true;
    }

    public MedidaCorporalEntitie? AdicionarMedida(
        int planoId,
        MedidaCorporalEntitie medida
    )
    {
        var planoExiste = _context.PlanosNutricao
            .Any(plano => plano.Id == planoId);

        if (!planoExiste)
        {
            return null;
        }

        medida.PlanoNutricaoId = planoId;

        _context.MedidasCorporais.Add(medida);
        _context.SaveChanges();

        return medida;
    }

    private IQueryable<PlanoNutricaoEntitie> ConsultaCompleta()
    {
        return _context.PlanosNutricao
            .Include(plano => plano.Aluno)
            .Include(plano => plano.Refeicoes)
            .Include(plano => plano.Medidas)
            .Include(plano => plano.Suplementos);
    }
}
