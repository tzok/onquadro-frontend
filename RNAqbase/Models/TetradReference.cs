using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RNAqbase.Models
{
	public class TetradReference : BaseEntity
	{
		public int Id { get; set; }
		public string Public_id { get; set; }
		public string Sequence { get; set; }
		public string OnzClass { get; set; }
		public string Dot_bracket { get; set; }
		public float Planarity { get; set; }
		public float Twist { get; set; }
		public float Rise { get; set; }
        public int Tetrad2_id { get; set; }
        public string Direction { get; set; }
        public int Quadruplex_id { get; set; }
        public int Quadruplex_pair_id { get; set; }
        public string Quadruplex_public_id { get; set; }
	}
}
