using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Repository.Entities;

public class ExercicioEntitie
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string MusculoPrin { get; set; }
    public int Descanso { get; set; }
    public int Reps { get; set; }
    public int Series { get; set; }
}
